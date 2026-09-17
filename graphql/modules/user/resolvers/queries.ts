import { getPrisma } from "@/lib/prisma/index";
import { getSession, requireSession } from "@/lib/auth/session";
import { Department, Role } from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";
import { accessibleBy } from "@casl/prisma";
import { defineAbility } from "@/lib/casl/defineAbility";

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
    args: {
      search?: string;
      userId?: number;
      role?: Role;
      department?: Department;
      categoryId?: number;
    }
  ) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    const prisma = await getPrisma();

    const { search, userId, role, department, categoryId } = args;

    // Visibilità per ruolo centralizzata nell'ability "read User":
    // - SYSTEM_ADMIN vede tutti gli utenti
    // - ADMIN vede solo il proprio dipartimento
    // - TECHNICIAN vede solo il proprio record
    // I filtri richiesti vengono comunque combinati in AND con la
    // visibilità, quindi non possono allargare ciò che l'utente può vedere.
    const where: Prisma.UserWhereInput = {
      AND: [accessibleBy(ability, "read").ofType("User")],
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (userId) {
      where.id = userId;
    }

    if (role) {
      where.role = role;
    }

    if (department) {
      where.department = department;
    }

    if (categoryId) {
      where.specializations = { some: { categoryId } };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        department: true,
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