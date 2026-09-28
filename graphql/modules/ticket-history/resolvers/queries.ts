import { getPrisma } from "@/lib/prisma/index";
import type { GraphQLContext } from "@/graphql/context";
import { paginateByCursor } from "@/graphql/pagination/pagination";
import {
  assertCanReadTicketHistory,
  getReadableTicketHistoryWhere,
} from "@/lib/casl/abilities/ticket-history/guards";
import { defineAbility } from "@/lib/casl/defineAbility";
import { Prisma } from "@/app/generated/prisma/client";
import { buildHistoryScopeWhere, buildTicketWhere } from "./where";
import type { TicketScope } from "@/graphql-generated/schema";

export const ticketHistoryQueries = {
  ticketHistory: async (
    _parent: unknown,
    args: { first?: number; after?: string; filter?: unknown },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const prisma = await getPrisma();


    const where: Prisma.TicketHistoryWhereInput = {
      AND: [getReadableTicketHistoryWhere(session), buildTicketWhere(args.filter)],
    };

    return paginateByCursor(args, {
      fetchPage: ({ take, skip, cursor }) =>
        prisma.ticketHistory.findMany({
          take,
          skip,
          cursor,
          where,
          include: {
            category: true,
            createdBy: true,
            assignedTo: true,
            lastUpdatedBy: true,
            deletedBy: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
    });
  },

  ticketHistoryByTicketId: async (
    _parent: unknown,
    args: { ticketId: number; first?: number; after?: string; filter?: unknown },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = await getPrisma();

    const existing = await prisma.ticketHistory.findFirst({
      where: { originalTicketId: args.ticketId },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });

    assertCanReadTicketHistory(ability, existing);

    const where: Prisma.TicketHistoryWhereInput = {
      AND: [
        getReadableTicketHistoryWhere(session),
        { originalTicketId: args.ticketId },
        buildTicketWhere(args.filter),
      ],
    };

    return paginateByCursor(args, {
      fetchPage: ({ take, skip, cursor }) =>
        prisma.ticketHistory.findMany({
          take,
          skip,
          cursor,
          where,
          include: {
            category: true,
            createdBy: true,
            assignedTo: true,
            lastUpdatedBy: true,
            deletedBy: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
    });
  },

  deletedTickets: async (
    _parent: unknown,
    args: {
      first?: number;
      after?: string;
      filter?: unknown;
      scope?: TicketScope;
    },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const scope: TicketScope = args.scope ?? "MINE";
    const prisma = await getPrisma();


    const where: Prisma.TicketHistoryWhereInput = {
      AND: [
        getReadableTicketHistoryWhere(session),
        buildHistoryScopeWhere(scope, session),
        { deletedAt: { not: null } },
        buildTicketWhere(args.filter),
      ],
    };

    return paginateByCursor(args, {
      fetchPage: ({ take, skip, cursor }) =>
        prisma.ticketHistory.findMany({
          take,
          skip,
          cursor,
          where,
          include: {
            category: true,
            createdBy: true,
            assignedTo: true,
            lastUpdatedBy: true,
            deletedBy: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
    });
  },
};