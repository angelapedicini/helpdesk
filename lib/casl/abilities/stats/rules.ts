import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import type { StatsAbility } from "./types";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

/**
 * Visibilità delle statistiche per dipartimento.
 *
 * - SYSTEM_ADMIN: tutte le statistiche, può filtrare per qualsiasi dipartimento.
 * - ADMIN: solo le statistiche del proprio dipartimento.
 */
export function defineAbilityForStats(user: AccessTokenPayload): StatsAbility {
  const { can, build } = new AbilityBuilder<StatsAbility>(createPrismaAbility);

  if (user.role === "SYSTEM_ADMIN") {
    can("read", "TicketStats");
    can("readAll", "TicketStats");
  }

  if (user.role === "ADMIN") {
    can("read", "TicketStats", { department: user.department });
  }

  return build();
}