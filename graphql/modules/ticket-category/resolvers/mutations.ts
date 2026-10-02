// graphql/modules/ticket-category/resolvers/mutations.ts
import type { GraphQLContext } from "@/graphql/context";
import { parseOrThrow } from "@/graphql/validate";
import { GraphQLError } from "graphql/error";
import { defineAbility } from "@/lib/casl/defineAbility";
import {
  assertCanManageTicketCategory,
  isUnrestrictedCategoryManager,
} from "@/lib/casl/abilities/category/guards";
import {
  CreateTicketCategorySchema,
  UpdateTicketCategorySchema,
  CreateTicketCategoryAccessSchema,
  UpdateCategorySchema,
} from "@/lib/validators/category.schema";
import type { Department, Role } from "@/lib/validators/enums.schema";
import { getSpecificFieldsForDepartment } from "@/lib/config/ticket-specific-field.config";
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
    args: { input: unknown },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);

    const prisma = context.prisma;

    const input = parseOrThrow(CreateTicketCategorySchema, args.input);

    // Il department è imposto dal resolver. SYSTEM_ADMIN può scegliere il
    // reparto dall'input; l'ADMIN può creare solo nel proprio dipartimento,
    // quindi il valore della sessione sovrascrive qualunque input.
    const department = isUnrestrictedCategoryManager(ability)
      ? input.department
      : session.department;

    assertCanManageTicketCategory(ability, "create", { department });

    if (input.specificField) {
      // Valida il campo specifico sullo scope di gestione effettivo,
      // non su quello (eventualmente diverso) inviato dal client.
      const allowedFields = getSpecificFieldsForDepartment(department);

      if (!allowedFields.includes(input.specificField)) {
        throw new GraphQLError(
          "Specific not valid for this category",
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }
    }

    return prisma.ticketCategory.create({
      data: { ...input, department },
    });
  },

  updateTicketCategory: async (
    _parent: unknown,
    args: { id: number; input: unknown },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    const input = parseOrThrow(UpdateTicketCategorySchema, args.input);

    const existing = await prisma.ticketCategory.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    // Enforcement per-oggetto via CASL: l'ADMIN aggiorna solo le categorie
    // del proprio reparto, SYSTEM_ADMIN tutte.
    assertCanManageTicketCategory(ability, "update", existing);

    if (input.specificField) {
      const allowedFields = getSpecificFieldsForDepartment(existing.department);
      if (!allowedFields.includes(input.specificField)) {
        throw new GraphQLError("Specifica non valida per il dipartimento della categoria", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    }

    return prisma.ticketCategory.update({
      where: { id: args.id },
      data: {
        ...input,
        updatedAt: new Date(),
        updatedBy: session.userId,
      },
    });
  },

  updateCategory: async (
    _parent: unknown,
    args: { id: number; input: unknown },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    const input = parseOrThrow(UpdateCategorySchema, args.input);

    const { accessGrants, ...patch } = input;
    const hasAccessGrants = accessGrants !== undefined;

    const existing = await prisma.ticketCategory.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    // Gestire la matrice = gestire la categoria: un unico check per-oggetto
    // copre sia i campi del catalogo sia i grant degli accessi.
    assertCanManageTicketCategory(ability, "update", existing);

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

  deleteTicketCategory: async (
    _parent: unknown,
    args: { id: number },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    const existing = await prisma.ticketCategory.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    assertCanManageTicketCategory(ability, "delete", existing);

    return prisma.ticketCategory.update({
      where: { id: args.id },
      data: { disabled: true, updatedAt: new Date(), updatedBy: session.userId },
    });
  },

  restoreTicketCategory: async (
    _parent: unknown,
    args: { id: number },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    const existing = await prisma.ticketCategory.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    assertCanManageTicketCategory(ability, "restore", existing);

    return prisma.ticketCategory.update({
      where: { id: args.id },
      data: { disabled: false, updatedAt: new Date(), updatedBy: session.userId },
    });
  },

  createTicketCategoryAccess: async (
    _parent: unknown,
    args: { input: unknown },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    const input = parseOrThrow(CreateTicketCategoryAccessSchema, args.input);

    const category = await prisma.ticketCategory.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    // Gestire la matrice = gestire la categoria (per-oggetto, CASL).
    assertCanManageTicketCategory(ability, "update", category);

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

  deleteTicketCategoryAccess: async (
    _parent: unknown,
    args: { id: number },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    const existing = await prisma.ticketCategoryAccess.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Access not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    const category = await prisma.ticketCategory.findUnique({
      where: { id: existing.categoryId },
    });
    if (!category) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    assertCanManageTicketCategory(ability, "update", category);

    return prisma.ticketCategoryAccess.update({
      where: { id: args.id },
      data: { disabled: true, updatedAt: new Date(), updatedBy: session.userId },
    });
  },

  restoreTicketCategoryAccess: async (
    _parent: unknown,
    args: { id: number },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    const existing = await prisma.ticketCategoryAccess.findUnique({
      where: { id: args.id },
    });
    if (!existing) {
      throw new GraphQLError("Access not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    const category = await prisma.ticketCategory.findUnique({
      where: { id: existing.categoryId },
    });
    if (!category) {
      throw new GraphQLError("Category not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    assertCanManageTicketCategory(ability, "update", category);

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