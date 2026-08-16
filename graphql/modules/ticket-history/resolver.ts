// modules/ticket/resolvers/queries/ticket-history.ts
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { paginateByCursor } from "@/graphql/pagination/pagination";
import type { TicketHistory as TicketHistoryRow } from "@/app/generated/prisma/client";

export const ticketHistoryResolvers = {
  Query: {
    ticketHistory: async (
      _parent: unknown,
      args: { ticketId: number; first?: number; after?: string }
    ) => {
      const session = await getSession();
      if (!session) {
        return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
      }

      const connection = await paginateByCursor<TicketHistoryRow>(args, {
        fetchPage: ({ take, skip, cursor }) =>
          prisma.ticketHistory.findMany({
            take,
            skip,
            cursor,
            where: { ticketId: args.ticketId },
            orderBy: { createdAt: "desc" },
          }),
      });

      return {
        ...connection,
        edges: connection.edges.map((edge) => ({
          ...edge,
          node: {
            id: edge.node.id,
            ticketId: edge.node.ticketId,
            createdAt: edge.node.createdAt,
            snapshotBefore: {
              ...(edge.node.snapshot as Record<string, unknown>),
              id: edge.node.id, // override: mai l'id del ticket, sempre quello della history
            },
          },
        })),
      };
    },
  },
};