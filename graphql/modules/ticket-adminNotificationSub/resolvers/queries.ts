import { getPrisma } from "@/lib/prisma/index";
import { requireAdmin } from "@/lib/auth/session";

export const ticketAdminNotificationQueries = {
    ticketNotificationSubscription: async (
        _parent: unknown,
        args: { ticketId: number }
    ) => {
        const session = await requireAdmin();
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