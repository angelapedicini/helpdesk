import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { requireSession } from "@/lib/auth/session";
import { defineAbilityFor } from "@/lib/casl/abilities";
import { accessibleBy } from "@casl/prisma";

export const ticketReadStateQueries = {
    unreadTicketMessages: async () => {
        const session = await requireSession();
        const ability = defineAbilityFor(session);

        // ticket accessibili in lettura (employee: propri creati, technician: assegnati, admin: reparto)
        const accessibleTickets = await prisma.ticket.findMany({
            where: {
                deletedAt: null,
                AND: [accessibleBy(ability, "read").ofType("Ticket")],
            },
            select: { id: true },
        });

        if (accessibleTickets.length === 0) return [];

        const ticketIds = accessibleTickets.map((t) => t.id);

        // per ogni ticket: messaggi non miei con id oltre l'ultimo letto
        // (o tutti, se non esiste ancora TicketReadState per quel ticket -> LEFT JOIN a NULL)
        const rows = await prisma.$queryRaw<{ ticketId: number; count: bigint }[]>`
            SELECT tm."ticketId" AS "ticketId", COUNT(*) AS "count"
            FROM "TicketMessage" tm
            LEFT JOIN "TicketReadState" trs
              ON trs."ticketId" = tm."ticketId" AND trs."userId" = ${session.userId}
            WHERE tm."ticketId" IN (${Prisma.join(ticketIds)})
              AND tm."authorId" != ${session.userId}
              AND (trs."lastReadMessageId" IS NULL OR tm."id" > trs."lastReadMessageId")
            GROUP BY tm."ticketId"
        `;

        return rows.map((r) => ({ ticketId: r.ticketId, count: Number(r.count) }));
    },
};