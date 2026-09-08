import { getPrisma } from "@/lib/prisma/index";
import { requireSession } from "@/lib/auth/session";
import { paginateByCursor } from "@/graphql/pagination/pagination";
import { getReadableTicketHistoryWhere } from "@/lib/casl/abilities/ticket-history/guards";
import { Prisma } from "@/app/generated/prisma/client";
import { buildHistoryScopeWhere, buildTicketWhere } from "./where";
import { TicketScope } from "../../ticket/resolvers/where";

export const ticketHistoryQueries = {
  ticketHistory: async (
    _parent: unknown,
    args: { first?: number; after?: string; filter?: unknown }
  ) => {
    const session = await requireSession();
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
    args: { ticketId: number; first?: number; after?: string; filter?: unknown }
  ) => {
    const session = await requireSession();
    const prisma = await getPrisma();


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
    }
  ) => {
    const session = await requireSession();
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