// lib/user/roleTransitions.ts
import { GraphQLError } from "graphql/error";
import type { Role } from "@/app/generated/prisma/enums";

// Transizioni consentite per updateUserRole.
// Nessuna promozione/demotion verso o da SYSTEM_ADMIN: chi è SYSTEM_ADMIN
// resta tale. I tre ruoli operativi sono intercambiabili tra loro.
export const ALLOWED_ROLE_TRANSITIONS: Partial<Record<Role, readonly Role[]>> = {
  EMPLOYEE: ["TECHNICIAN", "ADMIN"],
  TECHNICIAN: ["EMPLOYEE", "ADMIN"],
  ADMIN: ["EMPLOYEE", "TECHNICIAN"],
};

export function assertAllowedRoleTransition(from: Role, to: Role): void {
  const allowed = ALLOWED_ROLE_TRANSITIONS[from];
  if (!allowed?.includes(to)) {
    throw new GraphQLError(
      `Transizione di ruolo non consentita: ${from} -> ${to}`,
      { extensions: { code: "FORBIDDEN" } }
    );
  }
}