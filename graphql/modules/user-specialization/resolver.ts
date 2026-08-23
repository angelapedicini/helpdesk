import prisma from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/auth/session";
import { Department } from "@/app/generated/prisma/enums";
import { GraphQLError } from "graphql";

export const userSpecializationResolvers = {
  Query: {
    soleSpecialistCategoryIds: async (
      _parent: unknown,
      args: { department: Department; userId?: number }
    ) => {
      const session = await getSession();
      if (!session) return [];

      const targetUserId = args.userId ?? session.userId;

      const isSelf = targetUserId === session.userId;
      if (!isSelf && session.role !== "ADMIN") return [];

      const targetRole = isSelf
        ? session.role
        : (await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { role: true },
        }))?.role;

      if (targetRole !== "TECHNICIAN") return [];

      const specializations = await prisma.userSpecialization.groupBy({
        by: ["categoryId"],
        where: {
          category: { department: args.department },
        },
        _count: { userId: true },
      });

      const soleCategoryIds = specializations
        .filter((s) => s._count.userId === 1)
        .map((s) => s.categoryId);

      if (soleCategoryIds.length === 0) return [];

      const mine = await prisma.userSpecialization.findMany({
        where: {
          categoryId: { in: soleCategoryIds },
          userId: targetUserId,
        },
        select: { categoryId: true },
      });

      return mine.map((m) => m.categoryId);
    },
  },

  Mutation: {
    addUserSpecialization: async (
      _parent: unknown,
      args: { input: { userId: number; categoryId: number } }
    ) => {
      const session = await requireAdmin();
      if (!session) {
        throw new GraphQLError("Non autorizzato", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const { userId, categoryId } = args.input;

      const [user, category] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, department: true },
        }),
        prisma.ticketCategory.findUnique({
          where: { id: categoryId },
          select: { id: true, department: true },
        }),
      ]);

      if (!user) {
        throw new GraphQLError("Utente non trovato", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (!category) {
        throw new GraphQLError("Categoria non trovata", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (user.role !== "TECHNICIAN") {
        throw new GraphQLError("L'utente selezionato non è un tecnico", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (user.department !== category.department) {
        throw new GraphQLError(
          "La categoria non appartiene al dipartimento dell'utente",
          { extensions: { code: "BAD_USER_INPUT" } }
        );
      }

      try {
        const specialization = await prisma.userSpecialization.create({
          data: { userId, categoryId },
          include: { user: true, category: true },
        });

        return specialization;
      } catch (err) {
        // violazione @@unique([userId, categoryId])
        throw new GraphQLError("Specializzazione già assegnata", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    },

    removeUserSpecialization: async (
      _parent: unknown,
      args: { input: { userId: number; categoryId: number } }
    ) => {
      const session = await requireAdmin();
      if (!session) {
        throw new GraphQLError("Non autorizzato", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const { userId, categoryId } = args.input;

      try {
        await prisma.userSpecialization.delete({
          where: {
            userId_categoryId: { userId, categoryId },
          },
        });

        return true;
      } catch (err) {
        throw new GraphQLError("Specializzazione non trovata", {
          extensions: { code: "NOT_FOUND" },
        });
      }
    },
  },
};