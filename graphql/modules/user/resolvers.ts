import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Department, Role } from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";

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

    searchUsers: async (
      _parent: unknown,
      args: { search?: string; role?: Role; department?: Department }
    ) => {
      const { search, role, department } = args;

      const where: Prisma.UserWhereInput = {};

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ];
      }

      if (role) {
        where.role = role;
      }

      if (department) {
        where.department = department;
      }

      return prisma.user.findMany({
        where,
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