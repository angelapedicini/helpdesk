import { GraphQLError } from "graphql/error";
import { subject } from "@casl/ability";
import type { TicketScope } from "@/graphql-generated/schema";
import type { AppAbility } from "@/lib/casl/defineAbility";

export function toTicketScopeSubject(scope: TicketScope) {
  return subject("TicketScope", { __typename: "TicketScope", scope });
}

export function assertCanReadTicketScope(
  ability: AppAbility,
  scope: TicketScope
): void {
  if (ability.cannot("read", toTicketScopeSubject(scope))) {
    throw new GraphQLError("View not available to role", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}