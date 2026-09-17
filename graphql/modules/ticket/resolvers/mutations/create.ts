// modules/ticket/resolvers/mutations/create.ts
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { autoAssign } from "@/lib/ticket/autoAssign";
import { CreateTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { computeDueDate } from "@/lib/ticket/dueDate";
import { assertCanCreateTicket } from "@/lib/casl/abilities/ticket/guards";
import { defineAbility } from "@/lib/casl/defineAbility";
import { getAllowedCategories } from "@/lib/casl/abilities/category/guards";
import { getSpecificMapping } from "@/graphql/modules/ticket/resolvers/mutations/specific-field-config";
import { getPrisma } from "@/lib/prisma/index";
import { buildTicketHistoryData } from "@/lib/ticket/history";

export async function createTicket(_parent: unknown, args: { input: unknown }) {
  const session = await requireSession();
  const ability = defineAbility(session);
  const prisma = await getPrisma();

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
    const allowedCategories = await getAllowedCategories(prisma, ability);

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
    assignedToId = await autoAssign(prisma, input.categoryId, session.userId);
  }

  const dueFirstResponse = computeDueDate(input.priority);

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
        dueFirstResponse,
        ...specificCreate,
      },
      include: { category: true, createdBy: true, assignedTo: true },
    });

    await tx.ticketHistory.create({
      data: buildTicketHistoryData(created, {
        ticketSpecific: input.specificValue ?? null,
      }),
    });

    return created;
  });

  return ticket;
}