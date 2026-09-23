import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import type { TicketNotificationAbility } from "./types";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

export function defineAbilityForTicketNotification(
  user: AccessTokenPayload
): TicketNotificationAbility {
  const { can, build } = new AbilityBuilder<TicketNotificationAbility>(createPrismaAbility);

  // Ogni utente può leggere e cancellare le PROPRIE notifiche:
  // sia le subscription storiche (feature ticket-adminNotificationSub),
  // sia le notifiche leggere della campanella (tabella TicketNotification).
  // Il vincolo userId garantisce che si tocchino solo righe proprie.
  can("read", "TicketNotification", { userId: user.userId });
  can("delete", "TicketNotification", { userId: user.userId });

  // La creazione resta riservata ad admin e system admin: è l'operazione
  // di attivazione della subscription su un ticket. Le notifiche della
  // campanella vengono generate dal sistema nei resolver, non dagli utenti.
  if (user.role === "ADMIN" || user.role === "SYSTEM_ADMIN") {
    can("create", "TicketNotification", { userId: user.userId });
  }

  return build();
}