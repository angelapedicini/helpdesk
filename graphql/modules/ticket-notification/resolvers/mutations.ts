import { getPrisma } from "@/lib/prisma/index";
import type { GraphQLContext } from "@/graphql/context";
import { defineAbility } from "@/lib/casl/defineAbility";
import { accessibleBy } from "@casl/prisma";

export const ticketNotificationMutations = {
  // Delete-on-read: la campanella apre il ticket e cancella tutte le
  // notifiche di quel ticket per l'utente corrente. Il filtro CASL
  // garantisce che si cancellino solo le righe proprie.
  clearTicketNotifications: async (
    _parent: unknown,
    args: { ticketId: number },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = await getPrisma();

    const result = await prisma.ticketNotification.deleteMany({
      where: {
        AND: [
          accessibleBy(ability, "delete").ofType("TicketNotification"),
          { ticketId: args.ticketId },
        ],
      },
    });

    return result.count;
  },
};