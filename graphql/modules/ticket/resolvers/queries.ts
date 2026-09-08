// modules/ticket/resolvers/queries.ts
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { paginateByCursor } from "@/graphql/pagination/pagination";
import type { Prisma } from "@/app/generated/prisma/client";
import { SortArg, toPrismaOrderBy } from "@/graphql/sorting/sorting";
import { accessibleBy } from "@casl/prisma";
import { TicketSortField, TICKET_SORT_FIELD_MAP, TicketScope, buildTicketWhere, buildScopeWhere } from "./where";
import { defineAbilityForTicket } from "@/lib/casl/abilities/ticket/rules";

export const ticketQueries = {
  tickets: async (
    _parent: unknown,
    args: {
      first?: number;
      after?: string;
      orderBy?: SortArg<TicketSortField>;
      filter?: unknown;
      scope?: TicketScope;
    }
  ) => {
    const session = await requireSession();
    const ability = defineAbilityForTicket(session);

    const orderBy = toPrismaOrderBy<TicketSortField, Prisma.TicketOrderByWithRelationInput>(
      args.orderBy,
      TICKET_SORT_FIELD_MAP,
      { id: "desc" }
    );

    const scope: TicketScope = args.scope ?? "MINE";

    const where: Prisma.TicketWhereInput = {
      AND: [
        accessibleBy(ability, "read").ofType("Ticket"),
        buildScopeWhere(scope, session),
        buildTicketWhere(args.filter),
      ],
    };

    return paginateByCursor(args, {
      fetchPage: ({ take, skip, cursor }) =>
        prisma.ticket.findMany({
          take,
          skip,
          cursor,
          where,
          include: {
            category: true,
            createdBy: true,
            assignedTo: true,
            lastUpdatedBy: true,

            itSpecific: true,
            hrSpecific: true,
            financeSpecific: true,
            supportSpecific: true,
            logisticSpecific: true,
          },
          orderBy,
        }),
    });
  },

  ticket: async (_parent: unknown, args: { id: number }) => {
    const session = await requireSession();
    const ability = defineAbilityForTicket(session);

    return prisma.ticket.findFirst({
      where: {
        id: args.id,
        AND: [accessibleBy(ability, "read").ofType("Ticket")],
      },
      include: {
        category: true,
        createdBy: true,
        assignedTo: true,
        lastUpdatedBy: true,

        itSpecific: true,
        hrSpecific: true,
        financeSpecific: true,
        supportSpecific: true,
        logisticSpecific: true,
      },
    });
  },
};