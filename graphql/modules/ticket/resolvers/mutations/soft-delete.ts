// modules/ticket/resolvers/mutations/delete.ts

import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { defineAbilityFor } from "@/lib/casl/abilities";
import { assertCanDeleteTicket } from "@/lib/casl/ticket.guard";

export async function deleteTicket(
  _parent: unknown,
  args: { id: number }
) {
  const session = await requireSession();
  const ability = defineAbilityFor(session);

  const existing = await prisma.ticket.findUnique({
    where: { id: args.id },
  });

  if (!existing || existing.deletedAt) {
    throw new GraphQLError("Ticket non trovato", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  assertCanDeleteTicket(ability, existing);

  const deleted = await prisma.ticket.update({
    where: { id: args.id },
    data: {
      deletedAt: new Date(),
    },
    include: {
      category: true,
      createdBy: true,
      assignedTo: true,
    },
  });

  return deleted;
}