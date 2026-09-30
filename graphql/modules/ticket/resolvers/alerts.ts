// modules/ticket/resolvers/alerts.ts

import type { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import { accessibleBy } from "@casl/prisma";
import { buildScopeWhere, buildTicketWhere } from "./where";
import type { TicketScope } from "@/graphql-generated/schema";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { defineAbility } from "@/lib/casl/defineAbility";
import { assertCanReadTicketScope } from "@/lib/casl/abilities/ticket-scope/guards";

/**
 * I cinque contatori di TicketAlerts per uno scope.
 *
 * Vive qui perché è condiviso: lo usa sia la query ticketAlerts sia la
 * dashboard, così i due non possono divergere.
 *
 * Il client arriva dall'esterno (context.prisma) perché questa funzione gira
 * una volta per scope: se risolvesse il branch da sé, la dashboard la
 * chiamerebbe fino a quattro volte a richiesta.
 */
export async function countTicketAlerts(
  scope: TicketScope,
  session: AccessTokenPayload,
  prisma: PrismaClient
) {
  const ability = defineAbility(session);

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

  // Filtri costanti e tipizzati: nessun parse, TypeScript controlla le chiavi.
  const count = (filter: Parameters<typeof buildTicketWhere>[0]) =>
    prisma.ticket.count({ where: { AND: [baseWhere, buildTicketWhere(filter)] } });

  const [
    firstResponseOverdue,
    dueDateOverdue,
    reopened,
    firstResponseDueSoon,
    dueDateDueSoon,
  ] = await Promise.all([
    count({ firstResponseOverdue: true }),
    count({ overdue: true }),
    count({ reopened: true }),
    count({ firstResponseDueSoon: true }),
    count({ dueDateDueSoon: true }),
  ]);

  return {
    firstResponseOverdue,
    dueDateOverdue,
    reopened,
    firstResponseDueSoon,
    dueDateDueSoon,
  };
}
