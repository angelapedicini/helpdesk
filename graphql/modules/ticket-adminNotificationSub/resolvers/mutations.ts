import { getPrisma } from "@/lib/prisma/index";
import { requireAdmin } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";

export const ticketAdminNotificationMutations = {
    createTicketNotificationSubscription: async (
        _parent: unknown,
        args: { ticketId: number }
    ) => {
        const session = await requireAdmin();
        const prisma = await getPrisma();


        const ticket = await prisma.ticket.findUnique({
            where: {
                id: args.ticketId,
                // deletedAt: null 
            },
        });

        if (!ticket) {
            throw new GraphQLError("Ticket not found", { extensions: { code: "NOT_FOUND" } });
        }

        return prisma.ticketAdminNotificationSubscription.upsert({
            where: {
                userId_ticketId: {
                    userId: session.userId,
                    ticketId: ticket.id,
                },
            },
            create: {
                userId: session.userId,
                ticketId: ticket.id,
            },
            update: {}, // già esistente, nessuna modifica necessaria
        });
    },

    deleteTicketNotificationSubscription: async (
        _parent: unknown,
        args: { ticketId: number }
    ) => {
        const session = await requireAdmin();
        const prisma = await getPrisma();


        const existing = await prisma.ticketAdminNotificationSubscription.findUnique({
            where: {
                userId_ticketId: {
                    userId: session.userId,
                    ticketId: args.ticketId,
                },
            },
        });

        if (!existing) {
            throw new GraphQLError("Subscription to ticket not found", { extensions: { code: "NOT_FOUND" } });
        }

        return prisma.ticketAdminNotificationSubscription.delete({
            where: {
                userId_ticketId: {
                    userId: session.userId,
                    ticketId: args.ticketId,
                },
            },
        });
    },
};