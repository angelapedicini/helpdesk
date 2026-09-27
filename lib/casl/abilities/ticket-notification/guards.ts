import { GraphQLError } from "graphql/error";
import { subject } from "@casl/ability";
import type { TicketAdminNotificationSubscription } from "@/app/generated/prisma/client";
import type { AppAbility } from "@/lib/casl/defineAbility";

type TicketNotificationSubject = Pick<
  TicketAdminNotificationSubscription,
  "userId" | "ticketId"
>;

export function assertCanReadTicketNotification(
  ability: AppAbility,
  subscription: TicketNotificationSubject
): void {
  if (ability.cannot("read", subject("TicketNotification", subscription))) {
    throw new GraphQLError("Access denied", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

export function assertCanCreateTicketNotification(
  ability: AppAbility,
  subscription: TicketNotificationSubject
): void {
  if (ability.cannot("create", subject("TicketNotification", subscription))) {
    throw new GraphQLError(
      "User cannot subscribe to notifications on this ticket",
      { extensions: { code: "FORBIDDEN" } }
    );
  }
}

export function assertCanDeleteTicketNotification(
  ability: AppAbility,
  subscription: TicketNotificationSubject
): void {
  if (ability.cannot("delete", subject("TicketNotification", subscription))) {
    throw new GraphQLError(
      "User cannot unsubscribe from notifications on this ticket",
      { extensions: { code: "FORBIDDEN" } }
    );
  }
}