import { GraphQLError } from "graphql/error";
import { subject } from "@casl/ability";
import type { UserManagementAbility } from "./types";
import type { UserForAbility } from "./types";

export function toUserSubject(user: UserForAbility) {
  return subject("User", {
    __typename: "User",
    id: user.id,
    role: user.role,
  });
}

export function assertCanUpdateUserRole(
  ability: UserManagementAbility,
  target: UserForAbility
): void {
  if (ability.cannot("updateRole", toUserSubject(target))) {
    throw new GraphQLError("Non hai i permessi per modificare il ruolo di questo utente", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

export function assertCanManageSpecialization(
  ability: UserManagementAbility,
  target: UserForAbility
): void {
  if (ability.cannot("manageSpecialization", toUserSubject(target))) {
    throw new GraphQLError("Non hai i permessi per gestire le specializzazioni di questo utente", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}