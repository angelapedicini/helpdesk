import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Department } from "@/app/generated/prisma/enums";
import { getAllowedCategories } from "@/lib/casl/abilities/category/guards";

export const categoryQueries = {
    categories: async (
      _parent: unknown,
      args: { department?: Department }
    ) => {
      const session = await getSession();
      if (!session) return [];

      // const prisma = await getPrismaClient();

      const categories = await getAllowedCategories(prisma, {
        department: session.department,
        role: session.role,
      });

      if (args.department) {
        return categories.filter(
          (category) => category.department === args.department
        );
      }

      return categories;
    },

    categoryById: async (
      _parent: unknown,
      args: { id: number }
    ) => {
      const session = await getSession();
      if (!session) return null;

      // const prisma = await getPrismaClient();

      const allowed = await getAllowedCategories(prisma, {
        department: session.department,
        role: session.role,
      });

      const isAllowed = allowed.some((c) => c.id === args.id);
      if (!isAllowed) return null;

      return prisma.ticketCategory.findUnique({
        where: { id: args.id },
        select: { id: true, name: true, department: true, specificField: true },
      });
  },
};