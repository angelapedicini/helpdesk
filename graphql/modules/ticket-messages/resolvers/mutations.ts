// graphql/modules/ticket-message/resolvers/mutations.ts
import type { GraphQLContext } from "@/graphql/context";
import { defineAbility } from "@/lib/casl/defineAbility";
import { GraphQLError } from "graphql/error";
import {
    assertCanCreateTicketMessage,
    assertCanDeleteTicketMessage,
} from "@/lib/casl/abilities/ticket/guards";
import { parseOrThrow } from "@/graphql/validate";
import { TicketMessageFormSchema } from "@/lib/validators/ticket-message.schema";

export const ticketMessageMutations = {
    createTicketMessage: async (
        _parent: unknown,
        args: { input: { ticketId: number; content: string } },
        context: GraphQLContext
    ) => {
        const session = context.requireSession();
        const ability = defineAbility(session);
        const prisma = context.prisma;

        // Stesso schema del form: trim, non vuoto, lunghezza massima.
        // ticketId non fa parte dello schema, resta quello tipizzato da GraphQL (Int!).
        const { content } = parseOrThrow(TicketMessageFormSchema, {
            content: args.input.content,
        });

        const ticket = await prisma.ticket.findFirst({
            where: {
                id: args.input.ticketId,
                // deletedAt: null
            },
            select: {
                id: true,
                createdById: true,
                assignedToId: true,
                categoryId: true,
                ticketDepartment: true,
                status: true,
            },
        });

        if (!ticket) {
            throw new GraphQLError("Ticket not found", { extensions: { code: "NOT_FOUND" } });
        }

        assertCanCreateTicketMessage(ability, ticket);

        return prisma.ticketMessage.create({
            data: {
                content, // già trimmato dallo schema
                ticketId: ticket.id,
                authorId: session.userId,
            },
            select: {
                id: true,
                content: true,
                ticketId: true,
                createdAt: true,
                author: {
                    select: { id: true, firstName: true, lastName: true, role: true },
                },
                ticket: {
                    select: {
                        id: true,
                        status: true,
                        ticketDepartment: true,
                        categoryId: true,
                        createdById: true,
                        assignedToId: true,
                        createdBy: { select: { id: true, firstName: true, lastName: true } },
                        assignedTo: { select: { id: true, firstName: true, lastName: true } },
                        category: { select: { id: true, name: true } },
                    },
                },
            },
        });
    },

    deleteTicketMessage: async (
        _parent: unknown,
        args: { id: number },
        context: GraphQLContext
    ) => {
        const session = context.requireSession();
        const ability = defineAbility(session);
        const prisma = context.prisma;

        const existing = await prisma.ticketMessage.findUnique({
            where: { id: args.id },
        });

        if (!existing) {
            throw new GraphQLError("Message not found", { extensions: { code: "NOT_FOUND" } });
        }

        assertCanDeleteTicketMessage(ability, existing);

        return prisma.ticketMessage.delete({
            where: { id: args.id },
            select: {
                id: true,
                content: true,
                ticketId: true,
                createdAt: true,
                author: {
                    select: { id: true, firstName: true, lastName: true, role: true },
                },
            },
        });
    },
};