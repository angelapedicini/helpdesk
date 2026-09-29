// modules/auth/refresh/resolvers.ts
import { GraphQLError } from "graphql";
import { getPrisma } from "@/lib/prisma/index";
import { verifyRefreshToken, signAccessToken, signRefreshToken, buildAccessTokenPayload } from "@/lib/auth/jwt";
import { setAuthCookies, getRefreshToken, clearAuthCookies } from "@/lib/auth/cookies";

export const refreshResolvers = {
  Mutation: {
    refreshToken: async () => {
      const refreshToken = await getRefreshToken();
      const prisma = await getPrisma();

      console.log("refresh attivato")

      if (!refreshToken) {
        await clearAuthCookies();
        throw new GraphQLError("Refresh token mancante", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const payload = await verifyRefreshToken(refreshToken);
      if (!payload) {
        await clearAuthCookies();
        throw new GraphQLError("Refresh token non valido", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      // Il token firmato e la riga nel database devono appartenere allo
      // stesso utente: se non combaciano la sessione non è attendibile.
      if (!storedToken || storedToken.userId !== payload.userId) {
        if (storedToken) {
          await prisma.refreshToken.delete({ where: { token: refreshToken } });
        }
        await clearAuthCookies();
        throw new GraphQLError("Refresh token non conforme", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (storedToken.expiresAt < new Date()) {
        // Record scaduto: lo rimuoviamo comunque per pulizia
        await prisma.refreshToken.delete({ where: { token: refreshToken } });
        await clearAuthCookies();
        throw new GraphQLError("Refresh token scaduto", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Rotation
      await prisma.refreshToken.delete({ where: { token: refreshToken } });

      const newAccessToken = await signAccessToken(buildAccessTokenPayload(storedToken.user));
      const newRefreshToken = await signRefreshToken(storedToken.user.id);

      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await setAuthCookies(newAccessToken, newRefreshToken);

      return { success: true };
    },
  },
};