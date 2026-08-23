import { subject } from "@casl/ability";
import type { PrismaAbility, Subjects as PrismaSubjects } from "@casl/prisma";
import type { Ticket, TicketMessage, TicketStatus, Department } from "@/app/generated/prisma/client";
import type { Ticket as GraphQLTicket } from "@/apollo-client/queries/ticket/ticket.queries";
import type { TicketMessage as GraphQLTicketMessage } from "@/apollo-client/queries/ticket-message/ticket-message.queries";

// --- Tipi ---

export type Actions = "create" | "read" | "update" | "delete";

// Solo i campi che compaiono nelle condizioni di defineAbilityFor.
// Un Ticket Prisma reale (backend) soddisfa questo tipo per costruzione (è un superset).
// Un Ticket GraphQL mappato (frontend, via toTicketSubject) lo soddisfa altrettanto.
export type TicketForAbility = Pick<
  Ticket,
  "id" | "createdById" | "assignedToId" | "categoryId" | "status" | "ticketDepartment"
>;

/**
 * Le condizioni CASL su TicketMessage sono di due tipi:
 * - create: non esiste ancora l'istanza, la condizione dipende dal ticket
 *   padre → serve la relazione `ticket` annidata (stile Prisma).
 * - delete: istanza reale già esistente, condizione su `authorId` diretto.
 *
 * Campi opzionali perché il subject "finto" costruito per il check di
 * create non ha ancora id/authorId; un TicketMessage Prisma reale invece
 * li soddisfa sempre per costruzione (superset).
 */
export type TicketMessageForAbility = {
  id?: number;
  authorId?: number;
  ticketId: number;
  ticket?: TicketForAbility;
};

export type Subjects = PrismaSubjects<{
  Ticket: TicketForAbility;
  TicketMessage: TicketMessageForAbility;
}>;

export type AppAbility = PrismaAbility<[Actions, Subjects]>;

// --- Adapter FE: GraphQL (nested) → shape richiesta da CASL (flat) ---

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