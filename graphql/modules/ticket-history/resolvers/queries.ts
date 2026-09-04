// modules/ticket/resolvers/queries.ts
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { paginateByCursor } from "@/graphql/pagination/pagination";
import { accessibleBy } from "@casl/prisma";
import { defineAbilityForTicket } from "@/lib/casl/abilities/ticket/rules";
import { Prisma } from "@/app/generated/prisma/client";
import { buildTicketWhere } from "./where";

export const ticketHistory2Queries = {
  ticketHisotry: async (
    _parent: unknown,
    args: {
      first?: number;
      after?: string;
      filter?: unknown;
    }
  ) => {
    const session = await requireSession();


    const where: Prisma.TicketHistory2WhereInput = {
      AND: [
        buildTicketWhere(args.filter),
      ],
    };

    return paginateByCursor(args, {
      fetchPage: ({ take, skip, cursor }) =>
        prisma.ticketHistory2.findMany({
          take,
          skip,
          cursor,
          where,
          include: {
            category: true,
            createdBy: true,
            assignedTo: true,
            lastUpdatedBy: true,

          },
          orderBy: { updatedAt: "desc" },
        }),
    });
  },

  ticket: async (_parent: unknown, args: { id: number }) => {
    const session = await requireSession();
    const ability = defineAbilityForTicket(session);

    return prisma.ticketHistory2.findFirst({
      where: {
        id: args.id,
        // AND: [accessibleBy(ability, "read").ofType("Ticket")],
      },
      include: {
        category: true,
        createdBy: true,
        assignedTo: true,
        lastUpdatedBy: true,
      },
    });
  },
};