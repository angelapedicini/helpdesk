import { getPrisma } from "@/lib/prisma/index";
import { Prisma } from "@/app/generated/prisma/client";
import { requireSession } from "@/lib/auth/session";
import { defineAbilityForTicket } from "@/lib/casl/abilities/ticket/rules";
import { accessibleBy } from "@casl/prisma";

export const ticketReadStateQueries = {
    unreadTicketMessages: async () => {
        const session = await requireSession();
        const ability = defineAbilityForTicket(session);
        const prisma = await getPrisma();


        // Ticket accessibili in lettura:
        // - employee: propri ticket creati
        // - technician: ticket assegnati a lui
        // - admin: ticket del proprio reparto
        //
        // Per gli admin aggiungiamo un ulteriore filtro:
        // ricevono notifiche solo per i ticket che:
        // - hanno creato loro stessi
        // - oppure per i quali hanno attivato una subscription
        const accessibleTickets = await prisma.ticket.findMany({
            where: {
                // deletedAt: null,

                AND: [
                    accessibleBy(ability, "read").ofType("Ticket"),

                    ...(session.role === "ADMIN"
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