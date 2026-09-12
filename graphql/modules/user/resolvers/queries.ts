import { getPrisma } from "@/lib/prisma/index";
import { getSession, requireAdmin } from "@/lib/auth/session";
import { Department, Role } from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";

export const userQueries = {
  me: async () => {
    const session = await getSession();
    if (!session) return null;
    const prisma = await getPrisma();


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
    const prisma = await getPrisma();

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

  usersByDepartment: async (
    _parent: unknown,
    args: { userId?: number; role?: Role; categoryId?: number }
  ) => {
    const session = await getSession();
    if (!session) return [];
    const prisma = await getPrisma();


    if (session.role !== "ADMIN" && session.role !== "TECHNICIAN") {
      return [];
    }

    const { userId, role, categoryId } = args;

    const isAdmin = session.role === "ADMIN";

    const where: Prisma.UserWhereInput = {
      department: session.department,
      ...(categoryId
        ? { specializations: { some: { categoryId } } }
        : {}),
    };

    if (isAdmin) {
      // ADMIN: vede tutti gli utenti del dipartimento, filtrabili
      if (userId) where.id = userId;
      if (role) where.role = role;
    } else {
      // TECHNICIAN: vede solo il proprio record
      where.id = session.userId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        specializations: {
          select: {
            category: {
              select: { id: true, name: true, department: true },
            },
          },
        },
      },
      orderBy: { role: "asc" },
    });

    return users.map((u) => ({
      ...u,
      specializations: u.specializations.map((s) => s.category),
    }));
  },

   usersByDepForLogin: async (
    _parent: unknown,
    args: { department: Department; }
  ) => {
    const session = await getSession();
    if (!session) return [];
    const prisma = await getPrisma();

    const users = await prisma.user.findMany({
      where: { department: args.department },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: { role: "asc" },
    });

    return users;
  },
};