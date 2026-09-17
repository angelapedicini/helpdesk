import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import type { TicketNotificationAbility } from "./types";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

export function defineAbilityForTicketNotification(
  user: AccessTokenPayload
): TicketNotificationAbility {
  const { can, build } = new AbilityBuilder<TicketNotificationAbility>(createPrismaAbility);

  // Admin e System Admin possono attivare/disattivare le notifiche.
  // Read e delete sono limitati alla propria subscription.
  if (user.role === "ADMIN" || user.role === "SYSTEM_ADMIN") {
    can("create", "TicketNotification", { userId: user.userId });
    can("delete", "TicketNotification", { userId: user.userId });
    can("read", "TicketNotification", { userId: user.userId });
  }

  return build();
}