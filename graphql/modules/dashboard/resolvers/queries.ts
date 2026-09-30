// modules/dashboard/resolvers/queries.ts

import { getPrisma } from "@/lib/prisma/index";
import type { GraphQLContext } from "@/graphql/context";
import { accessibleBy } from "@casl/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { TicketScope } from "@/graphql-generated/schema";
import { defineAbility } from "@/lib/casl/defineAbility";
import { toTicketScopeSubject } from "@/lib/casl/abilities/ticket-scope/guards";
import { countTicketAlerts } from "@/graphql/modules/ticket/resolvers/alerts";
import { buildScopeWhere } from "@/graphql/modules/ticket/resolvers/where";
import { ALL_TICKET_SCOPES, DASHBOARD_LISTS } from "../lists";

const TICKET_LIST_SIZE = 3;
const NOTIFICATION_LIST_SIZE = 5;

const DASHBOARD_TICKET_SELECT = {
  id: true,
  title: true,
  status: true,
  createdAt: true,
  dueDate: true,
} satisfies Prisma.TicketSelect;

const NOTIFICATION_ACTOR_SELECT = {
  firstName: true,
  lastName: true,
} satisfies Prisma.UserSelect;

function fullName(user: { firstName: string; lastName: string } | null) {
  return user ? `${user.firstName} ${user.lastName}` : null;
}

export const dashboardQueries = {
  dashboard: async (
    _parent: unknown,
    _args: unknown,
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = await getPrisma();

    // Qui CASL filtra invece di bloccare: uno scope non leggibile non è un
    // errore, semplicemente non produce gruppi né liste.
    const canReadScope = (scope: TicketScope) =>
      ability.can("read", toTicketScopeSubject(scope));

    const visibleScopes = ALL_TICKET_SCOPES.filter(canReadScope);
    const visibleLists = DASHBOARD_LISTS.filter((def) =>
      canReadScope(def.scope)
    );

    const [counterGroups, ticketLists, notifications] = await Promise.all([
      Promise.all(
        visibleScopes.map(async (scope) => ({
          scope,
          alerts: await countTicketAlerts(scope, session),
        }))
      ),

      Promise.all(
        visibleLists.map(async (def) => ({
          list: def.list,
          tickets: await prisma.ticket.findMany({
            take: TICKET_LIST_SIZE,
            where: {
              AND: [
                accessibleBy(ability, "read").ofType("Ticket"),
                buildScopeWhere(def.scope, session),
              ],
            },
            orderBy: def.orderBy,
            select: DASHBOARD_TICKET_SELECT,
          }),
        }))
      ),

      prisma.ticketNotification.findMany({
        take: NOTIFICATION_LIST_SIZE,
        where: accessibleBy(ability, "read").ofType("TicketNotification"),
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          type: true,
          updatedAt: true,
          ticket: {
            select: {
              id: true,
              lastUpdatedBy: { select: NOTIFICATION_ACTOR_SELECT },
              createdBy: { select: NOTIFICATION_ACTOR_SELECT },
            },
          },
        },
      }),
    ]);

    return {
      counterGroups,
      ticketLists,
      // L'attore è chi ha fatto l'ultima azione, con fallback a chi ha aperto
      // il ticket: le notifiche hanno un solo autore per riga.
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        updatedAt: n.updatedAt,
        ticketId: n.ticket.id,
        actor: fullName(n.ticket.lastUpdatedBy ?? n.ticket.createdBy),
      })),
    };
  },
};
