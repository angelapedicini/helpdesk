// modules/ticket/resolvers/mutations/create.ts
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { autoAssign } from "@/lib/ticket/autoAssign";
import { CreateTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { computeDueDate } from "@/lib/ticket/dueDate";
import { assertCanCreateTicket } from "@/lib/casl/abilities/ticket/guards";
import { defineAbilityForTicket } from "@/lib/casl/abilities/ticket/rules";
import { getAllowedCategories } from "@/lib/casl/abilities/category/guards";
import { getSpecificMapping } from "@/graphql/modules/ticket/resolvers/mutations/specific-field-config";

export async function createTicket(_parent: unknown, args: { input: unknown }) {
  const session = await requireSession();
  const ability = defineAbilityForTicket(session);

  assertCanCreateTicket(ability);

  const result = CreateTicketSchema.safeParse(args.input);
  if (!result.success) {
    throw new GraphQLError("Invalid input", {
      extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
    });
  }
  const input = result.data;

  let category: Awaited<ReturnType<typeof getAllowedCategories>>[number] | undefined;

  if (input.categoryId !== undefined) {
    const allowedCategories = await getAllowedCategories(prisma, {
      department: session.department,
      role: session.role,
    });

    category = allowedCategories.find((c) => c.id === input.categoryId);
    if (!category) {
      throw new GraphQLError("Category not found for this user", {
        extensions: { code: "NOT_FOUND" },
      });
    }
  }

  // La categoria scelta prevede uno specificField ma non è arrivato alcun
  // valore -> errore. Se invece category.specificField è null (categoria
  // senza campo dinamico), non c'è nulla da richiedere: si passa oltre.
  if (category?.specificField && input.specificValue == null) {
    throw new GraphQLError(
      "Missing required specificValue for category with specificField", 
      { extensions: { code: "SPECIFIC_VALUE_REQUIRED" } }
    );
  }

  // Specifica mandata ma la categoria non ne prevede alcuna (o non è stata
  // scelta nessuna categoria): input non coerente, va rifiutato esplicitamente
  // invece di ignorare silenziosamente il valore.
  if (!category?.specificField && input.specificValue != null) {
    throw new GraphQLError(
      "No specifics for this category",
      { extensions: { code: "NO_SPECIFIC_VALUE" } }
    );
  }

  let specificCreate: Record<string, unknown> | undefined;

  if (category?.specificField && input.specificValue != null) {
    const mapping = getSpecificMapping(category.department, category.specificField);

    if (mapping.values && !mapping.values.includes(input.specificValue)) {
      throw new GraphQLError(
        `Value not valid for ${category.specificField}`,
        { extensions: { code: "BAD_USER_INPUT" } }
      );
    }

    specificCreate = {
      [mapping.tb]: { create: { [mapping.field]: input.specificValue } },
    };
  }

  let assignedToId = null;
  if (input.categoryId != undefined) {
    assignedToId = await autoAssign(input.categoryId, session.userId);
  }

  const dueDate = computeDueDate(input.priority);

  const ticket = await prisma.$transaction(async (tx) => {
    const created = await tx.ticket.create({
      data: {
        title: input.title,
        description: input.description,
        status: assignedToId ? "ASSIGNED" : "OPEN",
        categoryId: input.categoryId,
        priority: input.priority,
        createdById: session.userId,
        assignedToId,
        ticketDepartment: input.department,
        sourceDepartmentForUser: session.department,
        dueDate,
        ...specificCreate,
      },
      include: { category: true, createdBy: true, assignedTo: true },
    });

    const snapshot = {
      title: created.title,
      description: created.description,
      status: created.status,
      priority: created.priority,

      category: created.category
        ? {
          id: created.category.id,
          name: created.category.name,
          department: created.category.department,
        }
        : null,

      createdBy: {
        id: created.createdBy.id,
        firstName: created.createdBy.firstName,
        lastName: created.createdBy.lastName,
      },

      assignedTo: created.assignedTo
        ? {
          id: created.assignedTo.id,
          firstName: created.assignedTo.firstName,
          lastName: created.assignedTo.lastName,
        }
        : null,

      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      closedAt: created.closedAt,
      dueDate: created.dueDate,

      sourceDepartmentForUser: created.sourceDepartmentForUser,
      ticketDepartment: created.ticketDepartment,

      lastUpdatedBy: null,

      closingMessage: created.closingMessage,
      specificValue: input.specificValue ?? null,
    };

    await tx.ticketHistory.create({
      data: {
        ticketId: created.id,
        snapshot,
      },
    });

    return created;
  });

  return ticket;
}