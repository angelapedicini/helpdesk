// modules/auth/logout/resolvers.ts
import { getPrisma } from "@/lib/prisma/index";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth/cookies";
import { verifyRefreshToken } from "@/lib/auth/jwt";

export const logoutResolvers = {
  Mutation: {
    logout: async () => {
      const refreshToken = await getRefreshToken();

      // L'userId viene dal token firmato e non dal database: la firma resta
      // valida anche se la riga è già stata cancellata, così il logout chiude
      // tutte le sessioni anche quando la propria è stata rubata e ruotata via.
      const payload = refreshToken ? await verifyRefreshToken(refreshToken) : null;

      if (payload) {
        const prisma = await getPrisma();
        await prisma.refreshToken.deleteMany({ where: { userId: payload.userId } });
      }

      await clearAuthCookies();

      return { success: true };
    },
  },
};