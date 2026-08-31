// lib/casl/abilities/ticket/presentation.ts
import { useMemo } from "react";
import { useAbility } from "@/lib/casl/abilityContext";
import { toTicketSubject } from "./guards";
import type { TicketFieldsFragment } from "@/apollo-client/gql/graphql";

const TICKET_EDITABLE_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
  "categoryId",
  "assignedToId",
  "dueDate",
  "closingMessage",
] as const;

export type TicketFieldPermissions = Record<
  (typeof TICKET_EDITABLE_FIELDS)[number],
  boolean
>;

export function useTicketCreatePermission(): boolean {
  const ability = useAbility();
  return ability.can("create", "Ticket");
}

export function useTicketUpdatePermissions(
  ticket: TicketFieldsFragment
): { fields: TicketFieldPermissions; hasAnyEditableField: boolean } {
  const ability = useAbility();
  const subject = useMemo(() => toTicketSubject(ticket), [ticket]);

  const fields = useMemo(
    () =>
      Object.fromEntries(
        TICKET_EDITABLE_FIELDS.map((f) => [f, ability.can("update", subject, f)])
      ) as TicketFieldPermissions,
    [ability, subject]
  );

  const hasAnyEditableField = useMemo(
    () => Object.values(fields).some(Boolean),
    [fields]
  );

  return { fields, hasAnyEditableField };
}

export function useTicketDeletePermission(ticket: TicketFieldsFragment): boolean {
  const ability = useAbility();
  const subject = useMemo(() => toTicketSubject(ticket), [ticket]);
  return ability.can("delete", subject);
}

export function useTicketReadPermission(ticket: TicketFieldsFragment): boolean {
  const ability = useAbility();
  const subject = useMemo(() => toTicketSubject(ticket), [ticket]);
  return ability.can("read", subject);
}