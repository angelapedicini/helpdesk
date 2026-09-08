import { accessibleBy } from "@casl/prisma";
import { defineAbilityForTicketHistory } from "./rules";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type { Prisma } from "@/app/generated/prisma/client";

/**
 * Costruisce il filtro Prisma per la history leggibile dall'utente corrente,
 * secondo le regole CASL (creatore / assegnatario / dipartimento).
 *
 * Da usare in AND con eventuali altri filtri (es. filter utente, originalTicketId).
 */
export function getReadableTicketHistoryWhere(
  session: AccessTokenPayload
): Prisma.TicketHistoryWhereInput {
  const ability = defineAbilityForTicketHistory(session);
  return accessibleBy(ability, "read").ofType("TicketHistory");
}