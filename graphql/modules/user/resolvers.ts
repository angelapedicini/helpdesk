import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export const userResolvers = {
  Query: {
    me: async () => {
      const session = await getSession();
      if (!session) return null;

      return prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          roleName: true,
        },
      });
    },
  },
};