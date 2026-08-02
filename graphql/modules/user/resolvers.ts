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
          role: true,
          department: true,
        },
      });
    },

    searchUsers: async (_parent: unknown, args: { search?: string }) => {
      const { search } = args;

      return prisma.user.findMany({
        where: search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            }
          : undefined,
        // take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          department: true,
        },
      });
    },
  },
};