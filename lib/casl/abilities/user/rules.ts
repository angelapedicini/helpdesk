import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import type { UserManagementAbility } from "./types";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

export function defineAbilityForUserManagement(
  user: AccessTokenPayload
): UserManagementAbility {
  const { can, cannot, build } = new AbilityBuilder<UserManagementAbility>(createPrismaAbility);

  if (user.role === "SYSTEM_ADMIN") {
    can("read", "User");
    can("updateRole", "User");

    // Nessuna auto-modifica: impedisce auto-promozioni.
    cannot("updateRole", "User", { id: user.userId });

    // Nessun altro SYSTEM_ADMIN può essere modificato: evita lockout e
    // acquisizione di privilegi tramite manipolazione tra pari.
    cannot("updateRole", "User", { role: "SYSTEM_ADMIN" });
  }

  if (user.role === "ADMIN") {
    // L'admin vede solo gli utenti del proprio dipartimento.
    can("read", "User", { department: user.department });
    can("manageSpecialization", "User", { role: "TECHNICIAN" });
  }

  if (user.role === "TECHNICIAN") {
    // Il tecnico vede solo il proprio record (utile per le sue specializzazioni).
    can("read", "User", { id: user.userId });
  }

  return build();
}