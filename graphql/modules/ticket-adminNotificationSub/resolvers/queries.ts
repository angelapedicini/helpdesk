import { getPrisma } from "@/lib/prisma/index";
import { requireSession } from "@/lib/auth/session";
import { assertCanReadTicketNotification } from "@/lib/casl/abilities/ticket-notification/guards";
import { defineAbility } from "@/lib/casl/defineAbility";

export const ticketAdminNotificationQueries = {
    ticketNotificationSubscription: async (
        _parent: unknown,
        args: { ticketId: number }
    ) => {
        const session = await requireSession();
        const ability = defineAbility(session);
        assertCanReadTicketNotification(ability, {
            userId: session.userId,
            ticketId: args.ticketId,
        });
        const prisma = await getPrisma();


        return prisma.ticketAdminNotificationSubscription.findUnique({
            where: {
                userId_ticketId: {
                    userId: session.userId,
                    ticketId: args.ticketId,
                },
            },
        });
    },
};