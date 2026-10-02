import type { GraphQLContext } from "@/graphql/context";
import { paginateByCursor } from "@/graphql/pagination/pagination";
import { defineAbility } from "@/lib/casl/defineAbility";
import { accessibleBy } from "@casl/prisma";

export const ticketMessageQueries = {
  messages: async (
    _parent: unknown,
    args: { ticketId: number; first?: number; after?: string },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;


    // la visibilità dei messaggi dipende esclusivamente da quella
    // del ticket padre: nessuna regola diretta su TicketMessage per "read"
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: args.ticketId,
        // deletedAt: null,
        AND: [accessibleBy(ability, "read").ofType("Ticket")],
      },
      select: { id: true },
    });

    if (!ticket) {
      return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }

    return paginateByCursor(args, {
      fetchPage: ({ take, skip, cursor }) =>
        prisma.ticketMessage.findMany({
          take,
          skip,
          cursor,
          where: { ticketId: args.ticketId },
          orderBy: { id: "desc" },
          select: {
            id: true,
            content: true,
            ticketId: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
            // necessario per il typedef TicketMessage.ticket e per
            // toTicketMessageSubject lato FE (createdBy/assignedTo/category
            // annidati, coerentemente con quanto già fa ticketQueries)
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
        }),
    });
  },
};