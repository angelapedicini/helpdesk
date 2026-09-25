import { accessibleBy } from "@casl/prisma";
import { subject } from "@casl/ability";
import { GraphQLError } from "graphql/error";
import { defineAbility } from "@/lib/casl/defineAbility";
import type { AppAbility } from "@/lib/casl/defineAbility";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type { Prisma, TicketHistory } from "@/app/generated/prisma/client";

/**
 * Costruisce il filtro Prisma per la history leggibile dall'utente corrente,
 * secondo le regole CASL (creatore / assegnatario / dipartimento).
 *
 * Da usare in AND con eventuali altri filtri (es. filter utente, originalTicketId).
 */
export function getReadableTicketHistoryWhere(
  session: AccessTokenPayload
): Prisma.TicketHistoryWhereInput {
  const ability = defineAbility(session);
  return accessibleBy(ability, "read").ofType("TicketHistory");
}

export function assertCanReadTicketHistory(
  ability: AppAbility,
  existing: TicketHistory | null
): void {
  if (!existing || ability.cannot("read", subject("TicketHistory", existing))) {
    throw new GraphQLError("Ticket history is not accessible", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}
