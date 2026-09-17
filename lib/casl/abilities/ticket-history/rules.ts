import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import type { TicketHistoryAbility } from "./types";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

export function defineAbilityForTicketHistory(user: AccessTokenPayload): TicketHistoryAbility {
  const { can, build } = new AbilityBuilder<TicketHistoryAbility>(createPrismaAbility);

  // System Admin: tutta la history, nessuna condizione
  if (user.role === "SYSTEM_ADMIN") {
    can("read", "TicketHistory");
  }

  // Employee: solo la history dei ticket creati da lui
  can("read", "TicketHistory", { createdById: user.userId });

  // Technician: solo la history dei ticket a lui assegnati
  if (user.role === "TECHNICIAN") {
    can("read", "TicketHistory", { assignedToId: user.userId });
  }

  // Admin: tutta la history del proprio dipartimento
  if (user.role === "ADMIN") {
    can("read", "TicketHistory", { ticketDepartment: user.department });
  }

  return build();
}