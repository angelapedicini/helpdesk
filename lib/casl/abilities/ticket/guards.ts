import { GraphQLError } from "graphql/error";
import { subject } from "@casl/ability";
import { ALLOWED_STATUS_TRANSITIONS } from "./rules";
import type { AppAbility } from "@/lib/casl/defineAbility";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type { Department } from "@/app/generated/prisma/enums";
import type { Ticket, TicketMessage } from "@/app/generated/prisma/client";
import type { Ticket as GraphQLTicket } from "@/apollo-client/queries/ticket/ticket.queries";
import type { TicketMessage as GraphQLTicketMessage } from "@/apollo-client/queries/ticket-message/ticket-message.queries";
import { UpdateTicketInput } from "@/lib/validators/ticket-detail.schema";

// ================= Adapter FE: GraphQL (nested) → shape richiesta da CASL (flat) =================

/**
 * Converte un Ticket in shape GraphQL (nested: createdBy, assignedTo, category)
 * in un subject compatibile con le condizioni CASL, che sono scritte
 * in stile Prisma flat (createdById, assignedToId, categoryId).
 *
 * ticketDepartment è già flat e identico sia in GraphQL che in Prisma,
 * quindi non necessita mapping.
 */
export function toTicketSubject(ticket: GraphQLTicket) {
  return subject("Ticket", {
    ...ticket,
    categoryId: ticket.category?.id ?? null,
    createdById: ticket.createdBy.id,
    assignedToId: ticket.assignedTo?.id ?? null,
  });
}

/**
 * Subject "parziale" usato per la capability di presentazione in fase di
 * creazione (non esiste ancora un ticket): contiene solo ticketDepartment,
 * campo su cui è scritta la condizione CASL del technician.
 * Il cast è necessario perché CASL tipizza il subject come modello completo;
 * a runtime le condizioni mancanti non vengono valutate.
 */
export function toTicketDepartmentSubject(
  department: Department
): ReturnType<typeof toTicketSubject> {
  return subject("Ticket", {
    __typename: "Ticket",
    ticketDepartment: department,
  }) as unknown as ReturnType<typeof toTicketSubject>;
}

/**
 * Stesso principio di toTicketSubject: il messaggio GraphQL ha il ticket
 * padre annidato (con createdBy/assignedTo a loro volta nested); qui lo
 * riportiamo alla forma flat attesa dalle condizioni CASL su "ticket.*".
 *
 * Usato lato FE solo per il check di create (mostrare/nascondere il form
 * di risposta); per delete basta il messaggio stesso (authorId diretto).
 */
export function toTicketMessageSubject(message: GraphQLTicketMessage) {
  return subject("TicketMessage", {
    id: message.id,
    authorId: message.author.id,
    ticketId: message.ticket.id,
    ticket: {
      id: message.ticket.id,
      status: message.ticket.status,
      createdById: message.ticket.createdBy.id,
      assignedToId: message.ticket.assignedTo?.id ?? null,
      categoryId: message.ticket.category?.id ?? null,
      ticketDepartment: message.ticket.ticketDepartment,
    },
  });
}

// ================= Ticket =================

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
 * (creatore + stato ancora OPEN/ASSIGNED, come da regola in rules.ts).
 */
export function assertCanDeleteTicket(ability: AppAbility, existing: Ticket): void {
  const ticketSubject = subject("Ticket", existing);
  if (ability.cannot("delete", ticketSubject)) {
    throw new GraphQLError("Non hai i permessi per eliminare questo ticket", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

// ================= TicketMessage =================

/**
 * CREATE — non esiste ancora l'istanza del messaggio: la regola CASL dipende
 * dallo stato/relazioni del ticket padre, quindi costruiamo un subject
 * "finto" con la relazione ticket annidata, nella stessa forma usata
 * nelle condizioni di rules.ts (`{ ticket: { createdById, ... } }`).
 */
export function assertCanCreateTicketMessage(
  ability: AppAbility,
  ticket: Pick<Ticket, "id" | "createdById" | "assignedToId" | "categoryId" | "ticketDepartment" | "status">
): void {
  const messageSubject = subject("TicketMessage", {
    ticketId: ticket.id,
    ticket: {
      id: ticket.id,
      createdById: ticket.createdById,
      assignedToId: ticket.assignedToId,
      categoryId: ticket.categoryId,
      ticketDepartment: ticket.ticketDepartment,
      status: ticket.status,
    },
  });

  if (ability.cannot("create", messageSubject)) {
    throw new GraphQLError("Non hai i permessi per scrivere in questo ticket", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

/**
 * DELETE — istanza già esistente, check diretto su authorId
 * (come da regola in rules.ts).
 */
export function assertCanDeleteTicketMessage(
  ability: AppAbility,
  existing: TicketMessage
): void {
  const messageSubject = subject("TicketMessage", existing);

  if (ability.cannot("delete", messageSubject)) {
    throw new GraphQLError("Non hai i permessi per eliminare questo messaggio", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}