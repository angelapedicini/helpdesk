import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Department } from "@/app/generated/prisma/enums";

export const categoryResolvers = {
  Query: {
    categories: async (_parent: unknown, args: { department?: Department }) => {
      const session = await getSession();
      if (!session) return [];

      return prisma.ticketCategory.findMany({
        where: args.department ? { department: args.department } : undefined,
        select: {
          id: true,
          name: true,
          department: true,
        },
      });
    },
  },
};