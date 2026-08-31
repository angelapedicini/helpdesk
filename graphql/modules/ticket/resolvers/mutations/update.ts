// modules/ticket/resolvers/mutations/update.ts
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { UpdateTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { computeDueDate } from "@/lib/ticket/dueDate";
import { autoAssign } from "@/lib/ticket/autoAssign";
import { assertCanUpdateTicket } from "@/lib/casl/abilities/ticket/guards";
import { defineAbilityForTicket } from "@/lib/casl/abilities/ticket/rules";

export async function updateTicket(_parent: unknown, args: { id: number; input: unknown }) {
  const session = await requireSession();
  const ability = defineAbilityForTicket(session);

  const result = UpdateTicketSchema.safeParse(args.input);
  if (!result.success) {
    throw new GraphQLError("Input non valido", {
      extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
    });
  }
  const input = result.data;

  const existing = await prisma.ticket.findUnique({
    where: { id: args.id },
    include: { category: true, createdBy: true, assignedTo: true, lastUpdatedBy: true },
  });

  if (!existing || existing.deletedAt) {
    throw new GraphQLError("Ticket non trovato", { extensions: { code: "NOT_FOUND" } });
  }

  assertCanUpdateTicket(ability, session, existing, input);

  if (input.categoryId !== undefined && input.categoryId !== null) {
    const category = await prisma.ticketCategory.findUnique({ where: { id: input.categoryId } });
    if (!category) {
      throw new GraphQLError("Categoria non trovata", { extensions: { code: "NOT_FOUND" } });
    }
  }

  if (input.assignedToId !== undefined && input.assignedToId !== null) {
    const assignee = await prisma.user.findUnique({ where: { id: input.assignedToId } });
    if (!assignee) {
      throw new GraphQLError("Utente assegnatario non trovato", { extensions: { code: "NOT_FOUND" } });
    }
  }

  let closedAt: Date | undefined = undefined;
  let dueDate: Date | undefined = undefined;

  if (input.status === "CLOSED") {
    closedAt = new Date();
  }

  if (input.priority !== undefined && input.priority !== existing.priority && input.dueDate === undefined) {
    dueDate = computeDueDate(input.priority);
  }

  if (input.dueDate !== undefined) {
    dueDate = input.dueDate;
  }
  const categoryId = input.categoryId !== undefined ? input.categoryId : existing.categoryId;

  if (input.assignedToId !== undefined && input.assignedToId !== null && categoryId !== null) {
    const specialization = await prisma.userSpecialization.findUnique({
      where: {
        userId_categoryId: {
          userId: input.assignedToId,
          categoryId,
        },
      },
    });

    if (!specialization) {
      throw new GraphQLError(
        "L'utente assegnato non ha la specializzazione richiesta per questa categoria",
        { extensions: { code: "BAD_USER_INPUT" } }
      );
    }
  }

  let status = input.status;

  if (
    input.assignedToId !== undefined &&
    input.assignedToId !== null &&
    existing.status === "OPEN"
  ) {
    status = "ASSIGNED";
  }

  let assignedToId = input.assignedToId;

  if (input.categoryId !== undefined && input.categoryId !== null && input.assignedToId === undefined) {
    assignedToId = await autoAssign(input.categoryId, existing.createdById);
    status = "ASSIGNED";
  }

  // closingMessage arriva già validato come obbligatorio quando status è
  // CLOSED/REFUSED (vedi superRefine nello schema). Lo salvo sia sul Ticket
  // (cache per lettura rapida) sia come TicketMessage dedicato.
  const isClosingTransition = status === "CLOSED" || status === "REFUSED";
  const closingMessage = isClosingTransition ? input.closingMessage : undefined;

  // Transazione interattiva: lo snapshot ora fotografa lo stato DOPO
  // l'update (coerente con lo snapshot "di nascita" in create.ts), quindi
  // serve il risultato di ticket.update prima di poterlo costruire.
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.ticket.update({
      where: { id: args.id },
      data: {
        title: input.title,
        description: input.description,
        status: status,
        priority: input.priority,
        categoryId: input.categoryId,
        assignedToId: assignedToId,
        closedAt,
        dueDate,
        lastUpdatedById: session.userId,
        closingMessage,
      },
      include: { category: true, createdBy: true, assignedTo: true, lastUpdatedBy: true },
    });

    if (isClosingTransition) {
      await tx.ticketMessage.create({
        data: {
          ticketId: args.id,
          authorId: session.userId,
          content: closingMessage!,
          isClosingMessage: true,
        },
      });
    }

    const snapshotAfter = {
      title: result.title,
      description: result.description,
      status: result.status,
      priority: result.priority,

      category: result.category
        ? {
          id: result.category.id,
          name: result.category.name,
          department: result.category.department,
        }
        : null,

      createdBy: {
        id: result.createdBy.id,
        firstName: result.createdBy.firstName,
        lastName: result.createdBy.lastName,
      },

      assignedTo: result.assignedTo
        ? {
          id: result.assignedTo.id,
          firstName: result.assignedTo.firstName,
          lastName: result.assignedTo.lastName,
        }
        : null,

      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      closedAt: result.closedAt,
      dueDate: result.dueDate,
      deletedAt: result.deletedAt,

      sourceDepartmentForUser: result.sourceDepartmentForUser,
      ticketDepartment: result.ticketDepartment,

      lastUpdatedBy: result.lastUpdatedBy
        ? {
          id: result.lastUpdatedBy.id,
          firstName: result.lastUpdatedBy.firstName,
          lastName: result.lastUpdatedBy.lastName,
        }
        : null,

      closingMessage: result.closingMessage,
    };

    await tx.ticketHistory.create({
      data: {
        ticketId: args.id,
        snapshot: snapshotAfter,
      },
    });

    return result;
  });

  return updated;
}