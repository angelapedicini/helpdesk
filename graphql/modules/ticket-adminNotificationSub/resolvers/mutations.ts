import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";

export const ticketAdminNotificationMutations = {
        createTicketNotificationSubscription: async (
            _parent: unknown,
            args: { ticketId: number }
        ) => {
            const session = await requireAdmin();

            const ticket = await prisma.ticket.findUnique({
                where: { id: args.ticketId, deletedAt: null },
            });

            if (!ticket) {
                throw new GraphQLError("Ticket non trovato", { extensions: { code: "NOT_FOUND" } });
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

            const existing = await prisma.ticketAdminNotificationSubscription.findUnique({
                where: {
                    userId_ticketId: {
                        userId: session.userId,
                        ticketId: args.ticketId,
                    },
                },
            });

            if (!existing) {
                throw new GraphQLError("Sottoscrizione a notifiche non trovata", { extensions: { code: "NOT_FOUND" } });
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