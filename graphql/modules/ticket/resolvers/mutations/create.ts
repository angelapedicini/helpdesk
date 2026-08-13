// modules/ticket/resolvers/mutations/create.ts
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { defineAbilityFor } from "@/lib/casl/abilities";
import { autoAssign } from "@/lib/ticket/autoAssign";
import { CreateTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { computeDueDate } from "@/lib/ticket/dueDate";
import { assertCanCreateTicket } from "@/lib/casl/ticket.guard";

export async function createTicket(_parent: unknown, args: { input: unknown }) {
  const session = await requireSession();
  const ability = defineAbilityFor(session);

  assertCanCreateTicket(ability);

  const result = CreateTicketSchema.safeParse(args.input);
  if (!result.success) {
    throw new GraphQLError("Input non valido", {
      extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
    });
  }
  const input = result.data;

  //da rimuovere quando si consente categoria null per ticket non previsti
  //il controllo dovrebbe essere if input.category !== undefined

  if (input.categoryId !== undefined) {
    const category = await prisma.ticketCategory.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new GraphQLError("Categoria non trovata", {
        extensions: { code: "NOT_FOUND" },
      });
    }
  }

  //serve per ticket non previsti in modo tale da inserire null in assigned to id
  //admin andrà ad assegnalro a mano
  let assignedToId = null;
  if (input.categoryId != undefined) {
    assignedToId = await autoAssign(input.categoryId, session.userId);
  }

  // assignedToId = await autoAssign(input.categoryId, session.userId);
  const dueDate = computeDueDate(input.priority);

  return prisma.ticket.create({
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
    },
    include: { category: true, createdBy: true, assignedTo: true },
  });
}