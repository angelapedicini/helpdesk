import type { PrismaAbility, Subjects as PrismaSubjects } from "@casl/prisma";
import type { TicketHistory } from "@/app/generated/prisma/client";

export type TicketHistoryActions = "read" | "manage"; // test diagnostico

// Solo i campi usati nelle condizioni di defineAbilityForTicketHistory.
// A differenza di Ticket, qui ticketDepartment è un campo diretto (snapshot),
// non serve attraversare relazioni.
export type TicketHistoryForAbility = Pick<
  TicketHistory,
  "id" | "createdById" | "assignedToId" | "ticketDepartment"
>;

export type TicketHistorySubjects = PrismaSubjects<{
  TicketHistory: TicketHistoryForAbility;
}>;

export type TicketHistoryAbility = PrismaAbility<[TicketHistoryActions, TicketHistorySubjects]>;