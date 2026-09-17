import { getPrisma } from "@/lib/prisma/index";
import { requireSession } from "@/lib/auth/session";
import { defineAbility } from "@/lib/casl/defineAbility";
import { GraphQLError } from "graphql/error";
import { assertCanCreateTicketMessage, assertCanDeleteTicketMessage } from "@/lib/casl/abilities/ticket/guards";

export const ticketMessageMutations = {
    createTicketMessage: async (
        _parent: unknown,
        args: { input: { ticketId: number; content: string } }
    ) => {
        const session = await requireSession();
        const ability = defineAbility(session);
        const prisma = await getPrisma();


        if (!args.input.content?.trim()) {
            throw new GraphQLError("The message cannot be empty", {
                extensions: { code: "EMPTY_MESSAGE" },
            });
        }

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

        console.log({
            sessionUserId: session.userId,
            ticketCreatedById: ticket.createdById,
            ticketAssignedToId: ticket.assignedToId,
            ticketStatus: ticket.status,
            ticketDepartment: ticket.ticketDepartment,
        });

        assertCanCreateTicketMessage(ability, ticket);

        return prisma.ticketMessage.create({
            data: {
                content: args.input.content.trim(),
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

    deleteTicketMessage: async (_parent: unknown, args: { id: number }) => {
        const session = await requireSession();
        const ability = defineAbility(session);
        const prisma = await getPrisma();


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