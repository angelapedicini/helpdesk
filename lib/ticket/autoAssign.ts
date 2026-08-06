// lib/ticket/autoAssign.ts
import prisma from "@/lib/prisma";
import type { TicketStatus } from "@/app/generated/prisma/client";

const OPEN_TICKET_STATUSES: TicketStatus[] = ["OPEN", "ASSIGNED", "IN_PROGRESS"];

/**
 * Sceglie il tecnico da assegnare automaticamente a un ticket, tra quelli
 * specializzati sulla categoria indicata, privilegiando chi ha meno ticket
 * aperti al momento (bilanciamento del carico).
 *
 * Ritorna null se nessun tecnico è specializzato su quella categoria:
 * il chiamante decide come comportarsi (lasciare non assegnato, fallback, ecc.).
 */
export async function autoAssign(categoryId: number): Promise<number | null> {
  const specialists = await prisma.userSpecialization.findMany({
    where: { categoryId },
    select: { userId: true },
  });

  if (specialists.length === 0) return null;

  const specialistIds = specialists.map((s) => s.userId);

  // conta i ticket aperti per ciascuno specialista in un'unica query aggregata
  const openCounts = await prisma.ticket.groupBy({
    by: ["assignedToId"],
    where: {
      assignedToId: { in: specialistIds },
      status: { in: OPEN_TICKET_STATUSES },
      deletedAt: null,
    },
    _count: true,
  });

  const countMap = new Map<number, number>(
    openCounts
      .filter((c) => c.assignedToId !== null)
      .map((c) => [c.assignedToId as number, c._count])
  );

  // chi non compare nel risultato ha 0 ticket aperti
  let chosen = specialistIds[0];
  let minCount = countMap.get(chosen) ?? 0;

  for (const id of specialistIds) {
    const count = countMap.get(id) ?? 0;
    if (count < minCount) {
      chosen = id;
      minCount = count;
    }
  }

  return chosen;
}