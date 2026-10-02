import type { GraphQLContext } from "@/graphql/context";
import { defineAbility } from "@/lib/casl/defineAbility";
import { accessibleBy } from "@casl/prisma";

export const ticketNotificationQueries = {
  ticketNotifications: async (
    _parent: unknown,
    _args: unknown,
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    return prisma.ticketNotification.findMany({
      where: accessibleBy(ability, "read").ofType("TicketNotification"),
      orderBy: { updatedAt: "desc" },
      include: {
        ticket: {
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
        },
      },
    });
  },
};