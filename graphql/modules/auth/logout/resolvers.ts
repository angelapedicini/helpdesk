// modules/auth/logout/resolvers.ts
import prisma from "@/lib/prisma";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth/cookies";

export const logoutResolvers = {
  Mutation: {
    logout: async () => {
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
      }

      await clearAuthCookies();

      return { success: true };
    },
  },
};