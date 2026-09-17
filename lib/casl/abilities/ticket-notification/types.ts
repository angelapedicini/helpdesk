import type { PrismaAbility, Subjects as PrismaSubjects } from "@casl/prisma";
import type { TicketAdminNotificationSubscription } from "@/app/generated/prisma/client";

export type TicketNotificationActions = "create" | "read" | "delete";

// Solo i campi usati nelle condizioni di defineAbilityForTicketNotification.
export type TicketNotificationForAbility = Pick<
  TicketAdminNotificationSubscription,
  "userId" | "ticketId"
>;

export type TicketNotificationSubjects = PrismaSubjects<{
  TicketNotification: TicketNotificationForAbility;
}>;

export type TicketNotificationAbility = PrismaAbility<
  [TicketNotificationActions, TicketNotificationSubjects]
>;