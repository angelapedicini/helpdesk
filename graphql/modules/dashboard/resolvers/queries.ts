// modules/dashboard/resolvers/queries.ts

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

/** Solo i campi che le card della dashboard usano: niente relazioni.join. */
const DASHBOARD_TICKET_SELECT = {
  id: true,
  title: true,
  status: true,
  createdAt: true,
  dueDate: true,
} satisfies Prisma.TicketSelect;

export const dashboardQueries = {
  dashboard: async (
    _parent: unknown,
    _args: unknown,
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    // Qui CASL filtra, non blocca: uno scope non leggibile non è un errore,
    // semplicemente non produce gruppi né liste. Per questo si usa can e
    // non assertCanReadTicketScope, che solleverebbe.
    const canReadScope = (scope: TicketScope) =>
      ability.can("read", toTicketScopeSubject(scope));

    // Le regole del ruolo sull'oggetto Ticket valgono per ogni lista, in
    // qualunque scope: si compilano una volta sola e si riusano.
    const readableTickets = accessibleBy(ability, "read").ofType("Ticket");

    const visibleScopes = ALL_TICKET_SCOPES.filter(canReadScope);
    const visibleLists = DASHBOARD_LISTS.filter((def) =>
      canReadScope(def.scope)
    );

    // Promise.all per gruppo, non uno unico sui due gruppi: dentro ciascun
    // gruppo le query partono insieme, così si paga una volta sola l'attesa
    // di rete. Il carico totale non cambia (stesse query sugli stessi indici),
    // cambia solo quanto si sta in attesa: ~2 ondate invece di una per voce.
    const [counterGroups, ticketLists] = await Promise.all([
      Promise.all(
        visibleScopes.map(async (scope) => ({
          scope,
          alerts: await countTicketAlerts(scope, session, prisma),
        }))
      ),

      Promise.all(
        visibleLists.map(async (def) => ({
          list: def.list,
          tickets: await prisma.ticket.findMany({
            take: TICKET_LIST_SIZE,
            where: {
              AND: [readableTickets, buildScopeWhere(def.scope, session)],
            },
            orderBy: def.orderBy,
            select: DASHBOARD_TICKET_SELECT,
          }),
        }))
      ),
    ]);

    return { counterGroups, ticketLists };
  },
};
