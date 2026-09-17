import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import type { TicketScopeAbility } from "./types";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

/**
 * Quali "viste" (scope) di ticket può consultare un utente.
 *
 * Ogni scope corrisponde a una vista della lista ticket ed è la stessa
 * regola usata sia lato backend (buildScopeWhere) sia per i link di
 * navigazione, così l'autorizzazione resta centralizzata.
 */
export function defineAbilityForTicketScope(
  user: AccessTokenPayload
): TicketScopeAbility {
  const { can, build } = new AbilityBuilder<TicketScopeAbility>(
    createPrismaAbility
  );

  can("read", "TicketScope", { scope: "MINE" });

  if (user.role === "TECHNICIAN") {
    can("read", "TicketScope", { scope: "ASSIGNED_TO_ME" });
  }

  if (user.role === "ADMIN") {
    can("read", "TicketScope", { scope: "DEPARTMENT" });
  }

  if (user.role === "SYSTEM_ADMIN") {
    can("read", "TicketScope", { scope: "ALL" });
  }

  return build();
}