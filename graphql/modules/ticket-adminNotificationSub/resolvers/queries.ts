import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

export const ticketAdminNotificationQueries = {
    ticketNotificationSubscription: async (
        _parent: unknown,
        args: { ticketId: number }
    ) => {
        const session = await requireAdmin();

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