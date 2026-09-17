// lib/casl/abilities/ticket/presentation.ts
import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { useAbility } from "@/lib/casl/abilityContext";
import { toTicketSubject } from "./guards";
import { ALLOWED_STATUS_TRANSITIONS } from "./rules";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import type { TicketFieldsFragment } from "@/graphql-generated/graphql";
import type { TicketStatus } from "@/lib/validators/enums.schema";


const TICKET_EDITABLE_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
  "categoryId",
  "assignedToId",
  "dueDate",
  "closingMessage",
  "specificValue",
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

/**
 * Restituisce gli stati selezionabili nel Select "Status" del form
 * di update, riusando la stessa mappa di transizioni (ALLOWED_STATUS_TRANSITIONS)
 * che governa cosa è permesso lato server. Lo stato attuale resta
 * sempre incluso, anche quando non ci sono transizioni valide da lì,
 * altrimenti il Select non avrebbe un valore corrispondente da mostrare.
 */
export function useTicketAllowedStatuses(
  ticket: TicketFieldsFragment
): TicketStatus[] {
  const ability = useAbility();
  const subject = useMemo(() => toTicketSubject(ticket), [ticket]);

  const { data: meData } = useQuery(ME_QUERY);
  const role = meData?.me?.role;

  return useMemo(() => {
    // Se l'utente non ha nemmeno il permesso di toccare il campo status
    // per questo ticket, l'unica opzione mostrabile è quella attuale.
    if (!ability.can("update", subject, "status")) {
      return [ticket.status];
    }

    const transitions = role
      ? ALLOWED_STATUS_TRANSITIONS[role]?.[ticket.status] ?? []
      : [];

    return Array.from(
      new Set<TicketStatus>([ticket.status, ...(transitions as TicketStatus[])])
    );
  }, [ability, subject, role, ticket.status]);
}

/**
 * Determina come popolare il campo "Tecnico assegnato" nel form di update.
 * L'admin, quando il ticket è ancora OPEN, può scegliere tra tutti i
 * tecnici del proprio dipartimento (lista completa via searchUsers);
 * negli altri casi si usa la ricerca testuale filtrata per categoria
 * (usersForCategoryId).
 *
 * Il check ability.can(...) resta la guardia di base: se l'utente non
 * può proprio modificare assignedToId per questo ticket, il modo non è
 * rilevante (nessun campo verrà mostrato editabile comunque).
 */
export function useTicketAssigneeBrowseMode(
  ticket: TicketFieldsFragment
): "list" | "search" {
  const ability = useAbility();
  const subject = useMemo(() => toTicketSubject(ticket), [ticket]);

  return useMemo(() => {
    if (!ability.can("update", subject, "assignedToId")) {
      return "search";
    }

    return ability.can("browseAssignees", subject) ? "list" : "search";
  }, [ability, subject]);
}

/**
 * Determina se l'utente attuale può riaprire il ticket dal form.
 * Verifica che il ticket sia CLOSED o REFUSED e che l'utente abbia
 * il permesso CASL di aggiornarne il motivo di riapertura (reopenReason).
 */
export function useTicketCanReopen(ticket: TicketFieldsFragment): boolean {
  const ability = useAbility();
  const subject = useMemo(() => toTicketSubject(ticket), [ticket]);

  return useMemo(() => {
    const isClosedOrRefused = ticket.status === "CLOSED" || ticket.status === "REFUSED";
    return isClosedOrRefused && ability.can("update", subject, "reopenReason");
  }, [ability, subject, ticket.status]);
}