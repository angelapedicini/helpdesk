// modules/ticket/resolvers/queries.ts
import type { GraphQLContext } from "@/graphql/context";
import { paginateByCursor } from "@/graphql/pagination/pagination";
import type { Prisma } from "@/app/generated/prisma/client";
import { SortArg, toPrismaOrderBy } from "@/graphql/sorting/sorting";
import { accessibleBy } from "@casl/prisma";
import { TICKET_SORT_FIELD_MAP, buildTicketWhere, buildScopeWhere } from "./where";
import type { TicketScope, TicketSortField } from "@/graphql-generated/schema";
import { defineAbility } from "@/lib/casl/defineAbility";
import { assertCanReadTicket } from "@/lib/casl/abilities/ticket/guards";
import { FilterTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { parseOrThrow, stripNulls } from "@/graphql/validate";
import { countTicketAlerts } from "./alerts";

const TICKET_INCLUDE = {
  category: true,
  createdBy: true,
  assignedTo: true,
  lastUpdatedBy: true,
  itSpecific: true,
  hrSpecific: true,
  financeSpecific: true,
  supportSpecific: true,
  logisticSpecific: true,
} satisfies Prisma.TicketInclude;

export const ticketQueries = {
  tickets: async (
    _parent: unknown,
    args: {
      first?: number;
      after?: string;
      orderBy?: SortArg<TicketSortField>;
      filter?: Record<string, unknown> | null;
      scope?: TicketScope;
    },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    const filter = parseOrThrow(FilterTicketSchema, stripNulls(args.filter));

    const orderBy = toPrismaOrderBy<TicketSortField, Prisma.TicketOrderByWithRelationInput>(
      args.orderBy,
      TICKET_SORT_FIELD_MAP,
      { updatedAt: "desc" }
    );

    const scope: TicketScope = args.scope ?? "MINE";

    const where: Prisma.TicketWhereInput = {
      AND: [
        accessibleBy(ability, "read").ofType("Ticket"),
        buildScopeWhere(scope, session),
        buildTicketWhere(filter),
      ],
    };

    return paginateByCursor(args, {
      fetchPage: ({ take, skip, cursor }) =>
        prisma.ticket.findMany({
          take,
          skip,
          cursor,
          where,
          include: TICKET_INCLUDE,
          orderBy,
        }),
    });
  },

  ticket: async (
    _parent: unknown,
    args: { id: number },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    const existing = await prisma.ticket.findUnique({
      where: { id: args.id },
      include: TICKET_INCLUDE,
    });

    // Ticket inesistente: nessuna informazione sul motivo. Solo se il
    // ticket esiste viene applicato il controllo di autorizzazione.
    if (!existing) {
      return null;
    }

    assertCanReadTicket(ability, existing);

    return existing;
  },

  ticketAlerts: async (
    _parent: unknown,
    args: { scope?: TicketScope },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const scope: TicketScope = args.scope ?? "ASSIGNED_TO_ME";

    return countTicketAlerts(scope, session, context.prisma);
  },
};