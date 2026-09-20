// graphql/modules/ticket-category/resolvers/mutations.ts
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { defineAbility } from "@/lib/casl/defineAbility";
import {
  assertCanManageTicketCategory,
  assertCanManageTicketCategoryAccess,
} from "@/lib/casl/abilities/category/guards";
import {
  CreateTicketCategorySchema,
  UpdateTicketCategorySchema,
  CreateTicketCategoryAccessSchema,
} from "@/lib/validators/category.schema";
import { getSpecificFieldsForDepartment } from "@/lib/config/ticket-specific-field.config";
import { getPrisma } from "@/lib/prisma/index";

export const categoryMutations = {
  createTicketCategory: async (_parent: unknown, args: { input: unknown }) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    assertCanManageTicketCategory(ability, "create");
    const prisma = await getPrisma();

    const result = CreateTicketCategorySchema.safeParse(args.input);
    if (!result.success) {
      throw new GraphQLError("Invalid input", {
        extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
      });
    }

    const allowedFields = getSpecificFieldsForDepartment(result.data.department);
    if (!allowedFields.includes(result.data.specificField)) {
      throw new GraphQLError("Specifica non valida per il dipartimento selezionato", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    return prisma.ticketCategory.create({ data: result.data });
  },

  updateTicketCategory: async (
    _parent: unknown,
    args: { id: number; input: unknown }
  ) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    assertCanManageTicketCategory(ability, "update");
    const prisma = await getPrisma();

    const result = UpdateTicketCategorySchema.safeParse(args.input);
    if (!result.success) {
      throw new GraphQLError("Invalid input", {
        extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
      });
    }

    const existing = await prisma.ticketCategory.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    if (result.data.specificField) {
      const allowedFields = getSpecificFieldsForDepartment(existing.department);
      if (!allowedFields.includes(result.data.specificField)) {
        throw new GraphQLError("Specifica non valida per il dipartimento della categoria", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    }

    return prisma.ticketCategory.update({
      where: { id: args.id },
      data: {
        ...result.data,
        updatedAt: new Date(),
        updatedBy: session.userId,
      },
    });
  },

  deleteTicketCategory: async (_parent: unknown, args: { id: number }) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    assertCanManageTicketCategory(ability, "delete");
    const prisma = await getPrisma();

    const existing = await prisma.ticketCategory.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    return prisma.ticketCategory.update({
      where: { id: args.id },
      data: { disabled: true, updatedAt: new Date(), updatedBy: session.userId },
    });
  },

  restoreTicketCategory: async (_parent: unknown, args: { id: number }) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    assertCanManageTicketCategory(ability, "restore");
    const prisma = await getPrisma();

    const existing = await prisma.ticketCategory.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    return prisma.ticketCategory.update({
      where: { id: args.id },
      data: { disabled: null, updatedAt: new Date(), updatedBy: session.userId },
    });
  },

  createTicketCategoryAccess: async (_parent: unknown, args: { input: unknown }) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    assertCanManageTicketCategoryAccess(ability, "create");
    const prisma = await getPrisma();

    const result = CreateTicketCategoryAccessSchema.safeParse(args.input);
    if (!result.success) {
      throw new GraphQLError("Invalid input", {
        extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
      });
    }
    const input = result.data;
    const requesterDepartment = input.requesterDepartment ?? null;

    const category = await prisma.ticketCategory.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    // Il compound unique generato non accetta null per requesterDepartment
    // (limite del client generato), quindi cerchiamo per findFirst e poi
    // creiamo/aggiorniamo esplicitamente: @@unique garantisce che la riga
    // esista al massimo una volta.
    const existing = await prisma.ticketCategoryAccess.findFirst({
      where: {
        categoryId: input.categoryId,
        requesterDepartment,
        requesterMinRole: input.requesterMinRole,
      },
    });

    if (existing) {
      return prisma.ticketCategoryAccess.update({
        where: { id: existing.id },
        data: { disabled: null, updatedAt: new Date(), updatedBy: session.userId },
      });
    }

    return prisma.ticketCategoryAccess.create({
      data: {
        categoryId: input.categoryId,
        requesterDepartment,
        requesterMinRole: input.requesterMinRole,
      },
    });
  },

  deleteTicketCategoryAccess: async (_parent: unknown, args: { id: number }) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    assertCanManageTicketCategoryAccess(ability, "delete");
    const prisma = await getPrisma();

    const existing = await prisma.ticketCategoryAccess.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Access not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    return prisma.ticketCategoryAccess.update({
      where: { id: args.id },
      data: { disabled: true, updatedAt: new Date(), updatedBy: session.userId },
    });
  },

  restoreTicketCategoryAccess: async (_parent: unknown, args: { id: number }) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    assertCanManageTicketCategoryAccess(ability, "restore");
    const prisma = await getPrisma();

    const existing = await prisma.ticketCategoryAccess.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Access not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    return prisma.ticketCategoryAccess.update({
      where: { id: args.id },
      data: { disabled: null, updatedAt: new Date(), updatedBy: session.userId },
    });
  },
};