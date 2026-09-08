import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import type { TicketAbility } from "./types";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

export function defineAbilityForTicket(user: AccessTokenPayload): TicketAbility {
  const { can, cannot, build } = new AbilityBuilder<TicketAbility>(createPrismaAbility);

  const BASE_CREATE_FIELDS = ["title", "description", "categoryId", "priority", "department"] as const;

  can("create", "Ticket", [...BASE_CREATE_FIELDS]);

  // Il technician può impostare l'assegnatario in creazione,
  // ma solo per ticket nel proprio dipartimento
  if (user.role === "TECHNICIAN") {
    can("create", "Ticket", "assignedToId", { ticketDepartment: user.department });
  }

  // --- READ ---
  // Employee: solo i ticket creati da lui
  can("read", "Ticket", { createdById: user.userId });

  // Technician: solo i ticket assegnati a lui (in aggiunta ai propri creati come employee)
  if (user.role === "TECHNICIAN") {
    can("read", "Ticket", { assignedToId: user.userId });
  }

  // Admin: tutti i ticket del proprio reparto
  if (user.role === "ADMIN") {
    can("read", "Ticket", { ticketDepartment: user.department });
  }
  // --- UPDATE ---
  can("update", "Ticket", ["title", "description", "priority"], {
    createdById: user.userId,
    status: { in: ["OPEN", "ASSIGNED"] },
  });

  // employee (creatore) può modificare categoria e specificValue
  // finché il ticket è OPEN o ASSIGNED
  can("update", "Ticket", ["categoryId", "specificValue"], {
    createdById: user.userId,
    status: { in: ["OPEN", "ASSIGNED"] },
  });

  if (user.role === "TECHNICIAN") {
    can("update", "Ticket", ["status", "closingMessage"], { assignedToId: user.userId, status: "ASSIGNED" });
    can("update", "Ticket", ["priority"], { assignedToId: user.userId, status: "ASSIGNED" });
    can("update", "Ticket", ["status", "closedAt", "closingMessage"], { assignedToId: user.userId, status: "IN_PROGRESS" });
    can("update", "Ticket", ["dueDate"], { assignedToId: user.userId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } });
    can("update", "Ticket", ["assignedToId"], { assignedToId: user.userId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } });

    // technician assegnatario può modificare categoria e specificValue
    // finché il ticket è OPEN o ASSIGNED
    can("update", "Ticket", ["categoryId", "specificValue"], {
      assignedToId: user.userId,
      status: { in: ["OPEN", "ASSIGNED"] },
    });

    cannot("update", "Ticket", ["createdById",], {
      assignedToId: user.userId,
    }).because("Il technician non può modificare creatore di un ticket assegnatogli");
  }

  if (user.role === "ADMIN") {
    can("update", "Ticket", ["assignedToId"], {
      ticketDepartment: user.department,
      status: { in: ["OPEN", "ASSIGNED"] },
    });

    can("update", "Ticket", ["status", "closingMessage"], { ticketDepartment: user.department, status: "OPEN" });

    cannot("update", "Ticket", ["status"], {
      status: { in: ["IN_PROGRESS", "CLOSED"] },
    }).because("L'admin non può intervenire su un ticket già in lavorazione");

    cannot("update", "Ticket", ["createdById"], {
      ticketDepartment: user.department,
    }).because("L'admin non può modificare creatore o categoria di un ticket che non ha creato lui stesso");

    can("update", "Ticket", ["categoryId", "specificValue"], {
      ticketDepartment: user.department,
      status: { in: ["OPEN", "ASSIGNED"] },
    });

    can("update", "Ticket", ["priority"], {
      ticketDepartment: user.department,
      status: { in: ["OPEN", "ASSIGNED"] },
    });
  }

  // --- DELETE ---
  can("delete", "Ticket", { createdById: user.userId, status: { in: ["OPEN", "ASSIGNED"] } });

  // ================= TicketMessage =================

  // --- CREATE ---
  // Employee: può scrivere solo sui ticket che ha creato, finché non sono chiusi/rifiutati
  can("create", "TicketMessage", {
    "ticket.createdById": user.userId,
    "ticket.status": { notIn: ["CLOSED", "REFUSED"] },
  });

  if (user.role === "TECHNICIAN") {
    can("create", "TicketMessage", {
      "ticket.assignedToId": user.userId,
      "ticket.status": { in: ["ASSIGNED", "IN_PROGRESS"] },
    });
  }

  if (user.role === "ADMIN") {
    can("create", "TicketMessage", {
      "ticket.ticketDepartment": user.department,
      "ticket.status": { notIn: ["CLOSED", "REFUSED"] },
    });
  }

  // --- DELETE ---
  can("delete", "TicketMessage", { authorId: user.userId });

  return build();
}

export const ALLOWED_STATUS_TRANSITIONS: Partial<
  Record<AccessTokenPayload["role"], Partial<Record<string, string[]>>>
> = {
  TECHNICIAN: { ASSIGNED: ["IN_PROGRESS", "REFUSED"], IN_PROGRESS: ["CLOSED"] },
  ADMIN: { OPEN: ["ASSIGNED", "REFUSED"] },
};