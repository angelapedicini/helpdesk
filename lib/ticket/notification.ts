// lib/ticket/notification.ts
import type { Prisma, Ticket } from "@/app/generated/prisma/client";
import type { TicketNotificationType } from "@/app/generated/prisma/enums";

// Snapshot minimo del ticket sufficiente a calcolare cosa notificare:
// gli stessi campi sono presenti sia su `existing`/`created`/`result`
// (lato server) sia, in forma flat, sul ticket GraphQL.
export type TicketNotificationSnapshot = Pick<
  Ticket,
  | "id"
  | "status"
  | "priority"
  | "categoryId"
  | "assignedToId"
  | "createdById"
  | "ticketDepartment"
  | "dueDate"
  | "dueFirstResponse"
>;

type TicketNotificationChange = {
  type: TicketNotificationType;
  userIds: number[];
};

/**
 * Allinea la tabella leggera delle notifiche all'ultimo stato del ticket.
 *
 * Semantica upsert su (userId, ticketId, type): per ogni coppia resta una
 * sola riga, rinfrescata all'ultimo evento (updatedAt), così la campanella
 * legge e cancella velocemente senza storia. L'actorId viene sempre saltato
 * (non ci si notifica da soli).
 *
 * - `before === null`: ticket appena creato. Se già assegnato lo riceve
 *   l'assegnatario, altrimenti la ricevono gli admin del dipartimento del
 *   ticket (nuovo lavoro da prendere in carico).
 * - altrimenti a confronto: status/priorità/categoria/date andate al creatore,
 *   cambio assegnatario andato al nuovo assegnatario.
 */
export async function syncTicketNotifications(params: {
  tx: Prisma.TransactionClient;
  actorId: number;
  before: TicketNotificationSnapshot | null;
  after: TicketNotificationSnapshot;
}): Promise<void> {
  const changes: TicketNotificationChange[] = [];

  if (!params.before) {
    if (params.after.assignedToId != null) {
      changes.push({ type: "NEWTICKET", userIds: [params.after.assignedToId] });
    } else {
      const admins = await params.tx.user.findMany({
        where: { role: "ADMIN", department: params.after.ticketDepartment },
        select: { id: true },
      });
      changes.push({ type: "NEWTICKET", userIds: admins.map((admin) => admin.id) });
    }
  } else {
    if (params.before.status !== params.after.status) {
      changes.push({ type: "STATUS_CHANGED", userIds: [params.after.createdById] });
    }
    if (params.before.priority !== params.after.priority) {
      changes.push({ type: "PRIORITY_CHANGED", userIds: [params.after.createdById] });
    }
    if (params.before.categoryId !== params.after.categoryId) {
      changes.push({ type: "CATEGORY_CHANGED", userIds: [params.after.createdById] });
    }
    if (
      params.before.dueDate !== params.after.dueDate ||
      params.before.dueFirstResponse !== params.after.dueFirstResponse
    ) {
      changes.push({ type: "DATES_CHANGED", userIds: [params.after.createdById] });
    }
    if (
      params.before.assignedToId !== params.after.assignedToId &&
      params.after.assignedToId != null
    ) {
      changes.push({ type: "ASSIGNED", userIds: [params.after.assignedToId] });
    }
  }

  for (const change of changes) {
    for (const userId of change.userIds) {
      if (userId === params.actorId) continue;

      await params.tx.ticketNotification.upsert({
        where: {
          userId_ticketId_type: {
            userId,
            ticketId: params.after.id,
            type: change.type,
          },
        },
        create: {
          userId,
          ticketId: params.after.id,
          type: change.type,
        },
        // update vuoto: l'upsert serve solo a far risalire l'updatedAt (@updatedAt)
        update: {},
      });
    }
  }
}