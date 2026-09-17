import { getPrisma } from "@/lib/prisma/index";
import { Prisma } from "@/app/generated/prisma/client";
import { requireSession } from "@/lib/auth/session";
import { defineAbility } from "@/lib/casl/defineAbility";
import { accessibleBy } from "@casl/prisma";

export const ticketReadStateQueries = {
    unreadTicketMessages: async () => {
        const session = await requireSession();
        const ability = defineAbility(session);
        const prisma = await getPrisma();


        // Ticket accessibili in lettura:
        // - employee: propri ticket creati
        // - technician: ticket assegnati a lui
        // - admin: ticket del proprio reparto
        //
        // Per admin e system admin (chi può ricevere notifiche) aggiungiamo
        // un ulteriore filtro: ricevono notifiche solo per i ticket che:
        // - hanno creato loro stessi
        // - oppure per i quali hanno attivato una subscription
        const canFilterBySubscription = ability.can(
            "read",
            "TicketNotification"
        );

        const accessibleTickets = await prisma.ticket.findMany({
            where: {
                // deletedAt: null,

                AND: [
                    accessibleBy(ability, "read").ofType("Ticket"),

                    ...(canFilterBySubscription
                        ? [
                            {
                                OR: [
                                    {
                                        createdById: session.userId,
                                    },
                                    {
                                        adminNotificationSubscriptions: {
                                            some: {
                                                userId: session.userId,
                                            },
                                        },
                                    },
                                ],
                            },
                        ]
                        : []),
                ],
            },
            select: {
                id: true,
            },
        });

        if (accessibleTickets.length === 0) return [];

        const ticketIds = accessibleTickets.map((t) => t.id);

        // Per ogni ticket: messaggi non miei con id oltre l'ultimo letto.
        // Se non esiste ancora TicketReadState per quel ticket,
        // lastReadMessageId è NULL e vengono considerati tutti i messaggi altrui.
        const rows = await prisma.$queryRaw<
            { ticketId: number; count: bigint }[]
        >`
            SELECT
                tm."ticketId" AS "ticketId",
                COUNT(*) AS "count"
            FROM "TicketMessage" tm
            LEFT JOIN "TicketReadState" trs
                ON trs."ticketId" = tm."ticketId"
                AND trs."userId" = ${session.userId}
            WHERE tm."ticketId" IN (${Prisma.join(ticketIds)})
              AND tm."authorId" != ${session.userId}
              AND (
                  trs."lastReadMessageId" IS NULL
                  OR tm."id" > trs."lastReadMessageId"
              )
            GROUP BY tm."ticketId"
        `;

        return rows.map((r) => ({
            ticketId: r.ticketId,
            count: Number(r.count),
        }));
    },
};