// modules/ticket/resolvers/queries.ts
import { getPrisma } from "@/lib/prisma/index";
import type { GraphQLContext } from "@/graphql/context";
import { paginateByCursor } from "@/graphql/pagination/pagination";
import type { Prisma } from "@/app/generated/prisma/client";
import { SortArg, toPrismaOrderBy } from "@/graphql/sorting/sorting";
import { accessibleBy } from "@casl/prisma";
import { TICKET_SORT_FIELD_MAP, buildTicketWhere, buildScopeWhere } from "./where";
import type { TicketScope, TicketSortField } from "@/graphql-generated/schema";
import { defineAbility } from "@/lib/casl/defineAbility";
import { assertCanReadTicket } from "@/lib/casl/abilities/ticket/guards";
import { assertCanReadTicketScope } from "@/lib/casl/abilities/ticket-scope/guards";

export const ticketQueries = {
  tickets: async (
    _parent: unknown,
    args: {
      first?: number;
      after?: string;
      orderBy?: SortArg<TicketSortField>;
      filter?: unknown;
      scope?: TicketScope;
    },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = await getPrisma();


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

  ticket: async (
    _parent: unknown,
    args: { id: number },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = await getPrisma();

    const existing = await prisma.ticket.findUnique({
      where: { id: args.id },
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

    // Ticket inesistente: nessuna informazione sul motivo (stesso comportamento
    // di prima del check). Solo se il ticket esiste viene applicato il controllo
    // di autorizzazione alla lettura.
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
    const ability = defineAbility(session);
    const prisma = await getPrisma();

    const scope: TicketScope = args.scope ?? "ASSIGNED_TO_ME";
    assertCanReadTicketScope(ability, scope);

    // Stessa base della lista ticket: solo i ticket leggibili dall'utente
    // nello scope corrente. Ogni conteggio riusa buildTicketWhere, quindi
    // il numero coincide esattamente con il risultato del filtro analogo
    // applicato alla lista (zero drift tra contatore e filtro).
    const baseWhere: Prisma.TicketWhereInput = {
      AND: [
        accessibleBy(ability, "read").ofType("Ticket"),
        buildScopeWhere(scope, session),
      ],
    };

    const exceptionFilters = {
      firstResponseOverdue: { firstResponseOverdue: true },
      dueDateOverdue: { overdue: true },
      reopened: { reopened: true },
      firstResponseDueSoon: { firstResponseDueSoon: true },
      dueDateDueSoon: { dueDateDueSoon: true },
    } as const;

    const [
      firstResponseOverdue,
      dueDateOverdue,
      reopened,
      firstResponseDueSoon,
      dueDateDueSoon,
    ] = await Promise.all(
      Object.values(exceptionFilters).map((filter) =>
        prisma.ticket.count({
          where: {
            AND: [baseWhere, buildTicketWhere(filter)],
          },
        })
      )
    );

    return {
      firstResponseOverdue,
      dueDateOverdue,
      reopened,
      firstResponseDueSoon,
      dueDateDueSoon,
    };
  },
};