// modules/ticket/resolvers/mutations/update.ts
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { defineAbilityFor } from "@/lib/casl/abilities";
import { UpdateTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { computeDueDate } from "@/lib/ticket/dueDate";
import { assertCanUpdateTicket } from "@/lib/casl/ticket.guard";
import { autoAssign } from "@/lib/ticket/autoAssign";
import { stat } from "fs";

export async function updateTicket(_parent: unknown, args: { id: number; input: unknown }) {
  const session = await requireSession();
  const ability = defineAbilityFor(session);

  const result = UpdateTicketSchema.safeParse(args.input);
  if (!result.success) {
    throw new GraphQLError("Input non valido", {
      extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
    });
  }
  const input = result.data;

  const existing = await prisma.ticket.findUnique({ where: { id: args.id } });
  if (!existing || existing.deletedAt) {
    throw new GraphQLError("Ticket non trovato", { extensions: { code: "NOT_FOUND" } });
  }

  console.log("=== UPDATE DEBUG ===");
  console.log("args.input:", args.input);
  console.log("result.data:", result.data);
  console.log("Object.keys(input):", Object.keys(input));
  console.log("input.status:", input.status);
  console.log("input.title:", input.title);

  assertCanUpdateTicket(ability, session, existing, input);

  //controllo per categoria esistente
  if (input.categoryId !== undefined && input.categoryId !== null) {
    const category = await prisma.ticketCategory.findUnique({ where: { id: input.categoryId } });
    if (!category) {
      throw new GraphQLError("Categoria non trovata", { extensions: { code: "NOT_FOUND" } });
    }
  }

  //controllo per user id assegnato esistente
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

  if (input.priority !== undefined && input.priority !== existing.priority) {
    dueDate = computeDueDate(input.priority);
  }

  const categoryId = input.categoryId !== undefined ? input.categoryId : existing.categoryId;

  //controllo cambio assegnato. in tb specialization deve avere la stessa categoria del precedente
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

  //aggiunto histroy per update
  const [updated] = await prisma.$transaction([
    prisma.ticket.update({
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
      },
      include: { category: true, createdBy: true, assignedTo: true },
    }),
    prisma.ticketHistory.create({
      data: {
        ticketId: args.id,
        actorId: session.userId,
        snapshotBefore: JSON.parse(JSON.stringify(existing)),
      },
    }),
  ]);

  return updated;
}