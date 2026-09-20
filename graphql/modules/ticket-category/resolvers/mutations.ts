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
  UpdateCategorySchema,
} from "@/lib/validators/category.schema";
import type { Department, Role } from "@/lib/validators/enums.schema";
import { getSpecificFieldsForDepartment } from "@/lib/config/ticket-specific-field.config";
import { getPrisma } from "@/lib/prisma/index";
import type { PrismaClient } from "@/app/generated/prisma/client";

type TicketCategoryAccessClient = Pick<PrismaClient, "ticketCategoryAccess">;

type AccessGrantInput = {
  requesterDepartment: Department | null;
  requesterMinRole: Role;
};

// Riga (categoryId, departamento, ruolo): se esiste già la riattiva
// (soft delete annullato, stesso comportamento di createTicketCategoryAccess),
// altrimenti la crea. @@unique garantisce che la riga esista al massimo una volta.
async function ensureTicketCategoryAccessActive(
  client: TicketCategoryAccessClient,
  sessionUserId: number,
  input: AccessGrantInput & { categoryId: number }
) {
  const requesterDepartment = input.requesterDepartment ?? null;

  const existing = await client.ticketCategoryAccess.findFirst({
    where: {
      categoryId: input.categoryId,
      requesterDepartment,
      requesterMinRole: input.requesterMinRole,
    },
  });

  if (existing) {
    return client.ticketCategoryAccess.update({
      where: { id: existing.id },
      data: { disabled: false, updatedAt: new Date(), updatedBy: sessionUserId },
    });
  }

  return client.ticketCategoryAccess.create({
    data: {
      categoryId: input.categoryId,
      requesterDepartment,
      requesterMinRole: input.requesterMinRole,
    },
  });
}

// Soft-delete degli accessi attivi della categoria non più presenti
// nel set desiderato (semantica "la matrice inviata sostituisce la matrice attuale").
async function removeActiveCategoryAccessesNotIn(
  client: TicketCategoryAccessClient,
  sessionUserId: number,
  categoryId: number,
  keepGrants: AccessGrantInput[]
) {
  const keepKeys = new Set(
    keepGrants.map(
      (grant) => `${grant.requesterDepartment ?? "null"}:${grant.requesterMinRole}`
    )
  );

  const activeGrants = await client.ticketCategoryAccess.findMany({
    where: { categoryId, disabled: { not: true } },
  });

  for (const grant of activeGrants) {
    const key = `${grant.requesterDepartment ?? "null"}:${grant.requesterMinRole}`;
    if (!keepKeys.has(key)) {
      await client.ticketCategoryAccess.update({
        where: { id: grant.id },
        data: { disabled: true, updatedAt: new Date(), updatedBy: sessionUserId },
      });
    }
  }
}

// Mutua esclusione wildcard<->specifici: se il set desiderato contiene
// almeno una riga wildcard (requesterDepartment null), i grant specifici
// vengono scartati e quindi soft-deletati dal full-replace. Evita che
// convivano wildcard e specifici con semantica ambigua in ogni entry point.
function normalizeAccessGrants(grants: AccessGrantInput[]): AccessGrantInput[] {
  const hasWildcard = grants.some(
    (grant) => grant.requesterDepartment === null
  );
  if (!hasWildcard) {
    return grants;
  }
  return grants.filter((grant) => grant.requesterDepartment === null);
}

// Disattiva i grant della classe opposta a quella del grant che si sta
// inserendo/riattivando (wildcard vs specifico della categoria).
async function disableOppositeCategoryAccessGrants(
  client: TicketCategoryAccessClient,
  sessionUserId: number,
  categoryId: number,
  requesterDepartment: Department | null
) {
  const where =
    requesterDepartment === null
      ? { categoryId, requesterDepartment: { not: null } }
      : { categoryId, requesterDepartment: null };

  await client.ticketCategoryAccess.updateMany({
    where,
    data: { disabled: true, updatedAt: new Date(), updatedBy: sessionUserId },
  });
}

export const categoryMutations = {
  createTicketCategory: async (
    _parent: unknown,
    args: { input: unknown }
  ) => {
    const session = await requireSession();
    const ability = defineAbility(session);

    assertCanManageTicketCategory(ability, "create");

    const prisma = await getPrisma();

    const result = CreateTicketCategorySchema.safeParse(args.input);

    if (!result.success) {
      throw new GraphQLError("Invalid input", {
        extensions: {
          code: "BAD_USER_INPUT",
          issues: result.error.flatten(),
        },
      });
    }

    if (result.data.specificField) {
      const allowedFields = getSpecificFieldsForDepartment(
        result.data.department
      );

      if (!allowedFields.includes(result.data.specificField)) {
        throw new GraphQLError(
          "Specifica non valida per il dipartimento selezionato",
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }
    }

    return prisma.ticketCategory.create({
      data: result.data,
    });
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

  updateCategory: async (
    _parent: unknown,
    args: { id: number; input: unknown }
  ) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    assertCanManageTicketCategory(ability, "update");
    const prisma = await getPrisma();

    const result = UpdateCategorySchema.safeParse(args.input);
    if (!result.success) {
      throw new GraphQLError("Invalid input", {
        extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
      });
    }

    const { accessGrants, ...patch } = result.data;
    const hasAccessGrants = accessGrants !== undefined;

    if (hasAccessGrants) {
      assertCanManageTicketCategoryAccess(ability, "update");
    }

    const existing = await prisma.ticketCategory.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    if (patch.specificField) {
      const allowedFields = getSpecificFieldsForDepartment(existing.department);
      if (!allowedFields.includes(patch.specificField)) {
        throw new GraphQLError("Specifica non valida per il dipartimento della categoria", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    }

    return prisma.$transaction(async (tx) => {
      if (hasAccessGrants) {
        const normalizedGrants = normalizeAccessGrants(accessGrants);
        for (const grant of normalizedGrants) {
          await ensureTicketCategoryAccessActive(tx, session.userId, {
            categoryId: args.id,
            requesterDepartment: grant.requesterDepartment,
            requesterMinRole: grant.requesterMinRole,
          });
        }
        await removeActiveCategoryAccessesNotIn(
          tx,
          session.userId,
          args.id,
          normalizedGrants
        );
      }

      return tx.ticketCategory.update({
        where: { id: args.id },
        data: {
          ...patch,
          updatedAt: new Date(),
          updatedBy: session.userId,
        },
      });
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
      data: { disabled: false, updatedAt: new Date(), updatedBy: session.userId },
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

    const category = await prisma.ticketCategory.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    await disableOppositeCategoryAccessGrants(
      prisma,
      session.userId,
      input.categoryId,
      input.requesterDepartment ?? null
    );

    return ensureTicketCategoryAccessActive(prisma, session.userId, {
      categoryId: input.categoryId,
      requesterDepartment: input.requesterDepartment ?? null,
      requesterMinRole: input.requesterMinRole,
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

    await disableOppositeCategoryAccessGrants(
      prisma,
      session.userId,
      existing.categoryId,
      existing.requesterDepartment
    );

    return prisma.ticketCategoryAccess.update({
      where: { id: args.id },
      data: { disabled: false, updatedAt: new Date(), updatedBy: session.userId },
    });
  },
};