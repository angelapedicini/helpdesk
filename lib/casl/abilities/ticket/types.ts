import type { PrismaAbility, Subjects as PrismaSubjects } from "@casl/prisma";
import type { Ticket } from "@/app/generated/prisma/client";

export type TicketActions = "create" | "read" | "update" | "delete";

// Solo i campi che compaiono nelle condizioni di defineAbilityForTicket.
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

export type TicketSubjects = PrismaSubjects<{
  Ticket: TicketForAbility;
  TicketMessage: TicketMessageForAbility;
}>;

export type TicketAbility = PrismaAbility<[TicketActions, TicketSubjects]>;