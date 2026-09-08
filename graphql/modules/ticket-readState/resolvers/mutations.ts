import { getPrisma } from "@/lib/prisma/index";
import { requireSession } from "@/lib/auth/session";
import { defineAbilityForTicket } from "@/lib/casl/abilities/ticket/rules";
import { accessibleBy } from "@casl/prisma";
import { GraphQLError } from "graphql/error";

export const ticketReadStateMutations = {
    markTicketMessagesRead: async (
        _parent: unknown,
        args: { ticketId: number }
    ) => {

        const session = await requireSession();
        console.log(">>> MARK READ START", {
            userId: session.userId,
            ticketId: args.ticketId,
            time: new Date().toISOString(),
        });
        const ability = defineAbilityForTicket(session);
        const prisma = await getPrisma();


        // stessa regola di visibilità usata in ticketMessageQueries.messages
        const ticket = await prisma.ticket.findFirst({
            where: {
                id: args.ticketId,
                // deletedAt: null,
                AND: [accessibleBy(ability, "read").ofType("Ticket")],
            },
            select: { id: true },
        });

        if (!ticket) {
            throw new GraphQLError("Ticket not found", { extensions: { code: "NOT_FOUND" } });
        }

        // ultimo messaggio NON scritto dall'utente corrente
        const lastMessageFromOthers = await prisma.ticketMessage.findFirst({
            where: {
                ticketId: ticket.id,
                authorId: { not: session.userId },
            },
            orderBy: { id: "desc" },
            select: { id: true },
        });

        // nessun messaggio altrui: niente da segnare come letto,
        // ritorno lo stato attuale (se esiste) senza scrivere nulla
        if (!lastMessageFromOthers) {
            return prisma.ticketReadState.findUnique({
                where: {
                    userId_ticketId: { userId: session.userId, ticketId: ticket.id },
                },
                select: {
                    userId: true,
                    ticketId: true,
                    lastReadMessageId: true,
                    lastReadMessage: {
                        select: { id: true, content: true, createdAt: true },
                    },
                },
            });
        }

        console.log(">>> BEFORE UPSERT", {
            userId: session.userId,
            ticketId: ticket.id,
            lastMessageId: lastMessageFromOthers.id,
        });

        const result = await prisma.ticketReadState.upsert({
            where: {
                userId_ticketId: { userId: session.userId, ticketId: ticket.id },
            },
            create: {
                userId: session.userId,
                ticketId: ticket.id,
                lastReadMessageId: lastMessageFromOthers.id,
            },
            update: {
                lastReadMessageId: lastMessageFromOthers.id,
            },
            select: {
                userId: true,
                ticketId: true,
                lastReadMessageId: true,
                lastReadMessage: {
                    select: { id: true, content: true, createdAt: true },
                },
            },
        });

        console.log(">>> AFTER UPSERT", {
            userId: session.userId,
            ticketId: ticket.id,
        });

        return result;


    },
};