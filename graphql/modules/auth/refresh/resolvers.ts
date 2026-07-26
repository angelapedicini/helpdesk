// modules/auth/refresh/resolvers.ts
import { GraphQLError } from "graphql";
import prisma from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies, getRefreshToken, clearAuthCookies } from "@/lib/auth/cookies";

export const refreshResolvers = {
  Mutation: {
    refreshToken: async () => {
      const refreshToken = await getRefreshToken();

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

      if (!storedToken || storedToken.expiresAt < new Date()) {
        // Se il record esiste ma è scaduto, lo rimuoviamo comunque per pulizia
        if (storedToken) {
          await prisma.refreshToken.delete({ where: { token: refreshToken } });
        }
        await clearAuthCookies();
        throw new GraphQLError("Refresh token scaduto", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Rotation
      await prisma.refreshToken.delete({ where: { token: refreshToken } });

      const newAccessToken = await signAccessToken({
        userId: storedToken.user.id,
        role: storedToken.user.role,
      });
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