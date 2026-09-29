// modules/auth/refresh/resolvers.ts
import { GraphQLError } from "graphql";
import { getPrisma } from "@/lib/prisma/index";
import { verifyRefreshToken, signAccessToken, signRefreshToken, buildAccessTokenPayload } from "@/lib/auth/jwt";
import { setAuthCookies, getRefreshToken, clearAuthCookies } from "@/lib/auth/cookies";

// Deve coincidere con la scadenza che si da al token in lib/auth/jwt.ts
// (setExpirationTime("1d")): se la riga sopravvivesse al token che la rende
// valida, resterebbe a vita e il logout non potrebbe piu' ripulirla, perche'
// i cookie a quel punto sono gia' spariti.
const REFRESH_TTL_MS = 24 * 60 * 60 * 1000;

function log(event: string, extra: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ scope: "refresh", event, t: new Date().toISOString(), ...extra }));
}

function unauthenticated(message: string) {
  return new GraphQLError(message, { extensions: { code: "UNAUTHENTICATED" } });
}

function conflict(message: string) {
  return new GraphQLError(message, { extensions: { code: "REFRESH_CONFLICT" } });
}

export const refreshResolvers = {
  Mutation: {
    refreshToken: async () => {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        log("missing_cookie");
        throw unauthenticated("Refresh token mancante");
      }

      const payload = await verifyRefreshToken(refreshToken);
      const jti = (payload as { jti?: string } | null)?.jti?.slice(0, 8);

      if (!payload) {
        log("invalid_signature_or_expired");
        await clearAuthCookies(); // esito definitivo: una race non può produrlo
        throw unauthenticated("Refresh token non valido");
      }

      const prisma = await getPrisma();
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      // Non trovato: o è stato ruotato da una richiesta concorrente, o è
      // davvero invalido. Da qui non si distingue, quindi NON si cancellano
      // i cookie (il perdente non deve cancellare quelli del vincitore) e si
      // risponde con un codice che dice al client di riprovare.
      if (!storedToken) {
        log("not_in_db", { userId: payload.userId, jti });
        throw conflict("Refresh token non trovato");
      }

      if (storedToken.userId !== payload.userId) {
        log("user_mismatch", { jti });
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        await clearAuthCookies(); // esito definitivo
        throw unauthenticated("Refresh token non conforme");
      }

      if (storedToken.expiresAt < new Date()) {
        log("db_expired", { userId: payload.userId, jti });
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        await clearAuthCookies(); // esito definitivo
        throw unauthenticated("Refresh token scaduto");
      }

      // Firma dei nuovi token PRIMA della transazione, così resta breve
      const newAccessToken = await signAccessToken(buildAccessTokenPayload(storedToken.user));
      const newRefreshToken = await signRefreshToken(storedToken.user.id);

      // Rotazione atomica: solo UNA richiesta cancella la riga (count === 1).
      // Cancellazione e creazione stanno nella stessa transazione, quindi non
      // si resta senza refresh token se il processo cade a metà.
      const rotated = await prisma.$transaction(async (tx) => {
        const { count } = await tx.refreshToken.deleteMany({ where: { token: refreshToken } });
        if (count === 0) return false;

        await tx.refreshToken.create({
          data: {
            token: newRefreshToken,
            userId: storedToken.user.id,
            expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
          },
        });
        return true;
      });

      if (!rotated) {
        log("lost_race", { userId: storedToken.user.id, jti });
        throw conflict("Refresh già eseguito");
      }

      await setAuthCookies(newAccessToken, newRefreshToken);
      log("rotated", { userId: storedToken.user.id, oldJti: jti });

      return { success: true };
    },
  },
};