import { getPrisma } from "@/lib/prisma/index";
import type { GraphQLContext } from "@/graphql/context";
import { GraphQLError } from "graphql/error";
import { accessibleBy } from "@casl/prisma";
import {
    assertCanCreateTicketNotification,
    assertCanDeleteTicketNotification,
} from "@/lib/casl/abilities/ticket-notification/guards";
import { defineAbility } from "@/lib/casl/defineAbility";

export const ticketAdminNotificationMutations = {
    createTicketNotificationSubscription: async (
        _parent: unknown,
        args: { ticketId: number },
        context: GraphQLContext
    ) => {
        const session = context.requireSession();
        const ability = defineAbility(session);
        assertCanCreateTicketNotification(ability, {
            userId: session.userId,
            ticketId: args.ticketId,
        });
        const prisma = await getPrisma();


        // Solo ticket leggibili dall'utente (admin: solo del proprio reparto).
        const ticket = await prisma.ticket.findFirst({
            where: {
                id: args.ticketId,
                // deletedAt: null 
                AND: [accessibleBy(ability, "read").ofType("Ticket")],
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
        args: { ticketId: number },
        context: GraphQLContext
    ) => {
        const session = context.requireSession();
        const ability = defineAbility(session);
        assertCanDeleteTicketNotification(ability, {
            userId: session.userId,
            ticketId: args.ticketId,
        });
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