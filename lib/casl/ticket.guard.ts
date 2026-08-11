// lib/casl/ticket.guards.ts
import { GraphQLError } from "graphql/error";
import { subject } from "@casl/ability";
import { ALLOWED_STATUS_TRANSITIONS } from "./abilities";
import type { AppAbility } from "./types";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type { Ticket } from "@/app/generated/prisma/client";
import { UpdateTicketInput } from "../validators/ticket-detail.schema";

/**
 * CREATE — nessuna istanza esiste ancora, quindi il check è "type-level",
 * non ci sono campi/condizioni da valutare sull'oggetto.
 */
export function assertCanCreateTicket(ability: AppAbility): void {
  if (ability.cannot("create", "Ticket")) {
    throw new GraphQLError("Non hai i permessi per creare un ticket", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

/**
 * READ — per un singolo ticket già fetchato (es. query ticket(id)).
 * Per le liste, usa accessibleBy(ability) direttamente nella query Prisma
 * invece di questo assert.
 */
export function assertCanReadTicket(ability: AppAbility, existing: Ticket): void {
  const ticketSubject = subject("Ticket", existing);
  if (ability.cannot("read", ticketSubject)) {
    throw new GraphQLError("Non hai i permessi per visualizzare questo ticket", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

/**
 * UPDATE — verifica sia i permessi CASL campo per campo, sia le transizioni
 * di stato consentite per il ruolo dell'utente.
 */
export function assertCanUpdateTicket(
  ability: AppAbility,
  session: AccessTokenPayload,
  existing: Ticket,
  input: UpdateTicketInput
): void {
  const fieldsToCheck = (Object.keys(input) as (keyof typeof input)[]).filter(
    (field) => input[field] !== undefined
  );

  if (fieldsToCheck.length === 0) {
    throw new GraphQLError("Nessun campo da aggiornare", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const ticketSubject = subject("Ticket", existing);
  for (const field of fieldsToCheck) {
    if (ability.cannot("update", ticketSubject, field)) {
      throw new GraphQLError(`Non hai i permessi per modificare "${field}"`, {
        extensions: { code: "FORBIDDEN" },
      });
    }
  }

  if (input.status !== undefined) {
    const allowed = ALLOWED_STATUS_TRANSITIONS[session.role]?.[existing.status] ?? [];
    if (!allowed.includes(input.status)) {
      throw new GraphQLError(
        `Transizione di stato non valida: ${existing.status} → ${input.status}`,
        { extensions: { code: "BAD_USER_INPUT" } }
      );
    }
  }
}

/**
 * DELETE — verifica i permessi CASL sull'istanza esistente
 * (creatore + stato ancora OPEN/ASSIGNED, come da regola in abilities.ts).
 */
export function assertCanDeleteTicket(ability: AppAbility, existing: Ticket): void {
  const ticketSubject = subject("Ticket", existing);
  if (ability.cannot("delete", ticketSubject)) {
    throw new GraphQLError("Non hai i permessi per eliminare questo ticket", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}