// modules/ticket/resolvers/mutations/delete.ts
import { getPrisma } from "@/lib/prisma/index";
import { buildTicketHistoryData } from "@/lib/ticket/history";
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
    const now = new Date();

    await tx.ticketHistory.create({
      data: buildTicketHistoryData(existing, {
        ticketSpecific,
        lastUpdatedById: session.userId,
        updatedAt: now,
        deletedAt: now,
        deletedById: session.userId,
      }),
    });

    // onDelete: Cascade su tutte le *Specific verso Ticket -> basta questo,
    // Postgres elimina anche l'eventuale riga specifica collegata.
    await tx.ticket.delete({ where: { id: existing.id } });

    return existing;
  });

  return deleted;
}