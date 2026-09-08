// modules/auth/logout/resolvers.ts
import { getPrisma } from "@/lib/prisma/index";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth/cookies";

export const logoutResolvers = {
  Mutation: {
    logout: async () => {
      const refreshToken = await getRefreshToken();

      const prisma = await getPrisma();

      if (refreshToken) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
      }

      await clearAuthCookies();

      return { success: true };
    },
  },
};