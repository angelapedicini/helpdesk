import { subject } from "@casl/ability";
import type { PrismaAbility, Subjects as PrismaSubjects } from "@casl/prisma";
import type { Ticket, TicketStatus, Department } from "@/app/generated/prisma/client";
import type { Ticket as GraphQLTicket } from "@/apollo-client/queries/ticket/ticket.queries";

// --- Tipi ---

export type Actions = "create" | "read" | "update" | "delete";

// Solo i campi che compaiono nelle condizioni di defineAbilityFor.
// Un Ticket Prisma reale (backend) soddisfa questo tipo per costruzione (è un superset).
// Un Ticket GraphQL mappato (frontend, via toTicketSubject) lo soddisfa altrettanto.
export type TicketForAbility = Pick<
  Ticket,
  "id" | "createdById" | "assignedToId" | "categoryId" | "status" | "ticketDepartment"
>;

export type Subjects = PrismaSubjects<{ Ticket: TicketForAbility }>;
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