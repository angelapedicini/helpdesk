// modules/ticket/resolvers/mutations/delete.ts
import { getPrisma } from "@/lib/prisma/index";
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { defineAbilityForTicket } from "@/lib/casl/abilities/ticket/rules";
import { assertCanDeleteTicket } from "@/lib/casl/abilities/ticket/guards";
import { getSpecificMapping } from "./specific-field-config";

export async function deleteTicket(_parent: unknown, args: { id: number }) {
  const session = await requireSession();
  const ability = defineAbilityForTicket(session);
  const prisma = await getPrisma();

  const existing = await prisma.ticket.findUnique({
    where: { id: args.id },
    include: {
      category: true,
      createdBy: true,
      assignedTo: true,
      lastUpdatedBy: true,
      itSpecific: true,
      hrSpecific: true,
      financeSpecific: true,
      supportSpecific: true,
      logisticSpecific: true,
    },
  });

  if (!existing) {
    throw new GraphQLError("Ticket not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // CASL: creatore + eventuali condizioni aggiuntive (es. stato ancora
  // OPEN/ASSIGNED) definite nella rule "delete" in rules.ts.
  assertCanDeleteTicket(ability, existing);

  // ticketSpecific: letto dalla mappatura della categoria ATTUALE del ticket
  // al momento della cancellazione, stesso pattern di oldSpecificValue in
  // update.ts. Qui non c'è nessun input da cui prendere un valore nuovo.
  const mapping = existing.category?.specificField
    ? getSpecificMapping(existing.category.department, existing.category.specificField)
    : null;

  const ticketSpecific: string | null = mapping
    ? ((existing[mapping.tb] as Record<string, unknown> | null)?.[mapping.field] as string) ?? null
    : null;

  const deleted = await prisma.$transaction(async (tx) => {
    await tx.ticketHistory.create({
      data: {
        originalTicketId: existing.id,

        title: existing.title,
        description: existing.description,
        status: existing.status,
        priority: existing.priority,

        categoryId: existing.categoryId,
        createdById: existing.createdById,
        assignedToId: existing.assignedToId,
        lastUpdatedById: session.userId,

        closingMessage: existing.closingMessage,

        sourceDepartmentForUser: existing.sourceDepartmentForUser,
        ticketDepartment: existing.ticketDepartment,

        ticketSpecific,

        createdAt: existing.createdAt,
        updatedAt:  new Date(),
        dueDate: existing.dueDate,
        closedAt: existing.closedAt,

        deletedAt: new Date(),
        deletedById: session.userId,
      },
    });

    // onDelete: Cascade su tutte le *Specific verso Ticket -> basta questo,
    // Postgres elimina anche l'eventuale riga specifica collegata.
    await tx.ticket.delete({ where: { id: existing.id } });

    return existing;
  });

  return deleted;
}