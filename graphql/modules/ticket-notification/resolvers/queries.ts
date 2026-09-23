import { getPrisma } from "@/lib/prisma/index";
import { requireSession } from "@/lib/auth/session";
import { defineAbility } from "@/lib/casl/defineAbility";
import { accessibleBy } from "@casl/prisma";

export const ticketNotificationQueries = {
  ticketNotifications: async () => {
    const session = await requireSession();
    const ability = defineAbility(session);
    const prisma = await getPrisma();

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