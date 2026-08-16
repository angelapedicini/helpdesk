import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import type { AppAbility } from "./types";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

export function defineAbilityFor(user: AccessTokenPayload): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

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

  // --- UPDATE (invariato rispetto a prima) ---
  can("update", "Ticket", ["title", "description", "categoryId", "priority"], {
    createdById: user.userId,
    status: { in: ["OPEN", "ASSIGNED"] },
  });

  if (user.role === "TECHNICIAN") {
    // ASSIGNED -> REFUSED: il technician può rifiutare, quindi deve poter
    // inviare anche closingMessage insieme allo status
    can("update", "Ticket", ["status", "closingMessage"], { assignedToId: user.userId, status: "ASSIGNED" });
    can("update", "Ticket", ["priority"], { assignedToId: user.userId, status: "ASSIGNED" });

    // IN_PROGRESS -> CLOSED: idem, il messaggio di chiusura va insieme
    // a status e closedAt nella stessa transizione
    can("update", "Ticket", ["status", "closedAt", "closingMessage"], { assignedToId: user.userId, status: "IN_PROGRESS" });

    can("update", "Ticket", ["dueDate"], { assignedToId: user.userId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } });
    can("update", "Ticket", ["assignedToId"], { assignedToId: user.userId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } });
    can("update", "Ticket", ["dueDate"], { assignedToId: user.userId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } });


    // il divieto vale SOLO quando il technician sta agendo da assegnatario,
    // non quando è lui il creatore del ticket
    cannot("update", "Ticket", ["createdById", "categoryId"], {
      assignedToId: user.userId,
    }).because("Il technician non può modificare creatore o categoria di un ticket assegnatogli");
  }

  if (user.role === "ADMIN") {
    can("update", "Ticket", ["assignedToId"], {
      ticketDepartment: user.department,
      status: { in: ["OPEN", "ASSIGNED"] },
    });

    // OPEN -> REFUSED (vedi ALLOWED_STATUS_TRANSITIONS): l'admin può rifiutare
    // un ticket ancora aperto, quindi deve poter inviare closingMessage
    can("update", "Ticket", ["status", "closingMessage"], { ticketDepartment: user.department, status: "OPEN" });

    cannot("update", "Ticket", ["status"], {
      status: { in: ["IN_PROGRESS", "CLOSED"] },
    }).because("L'admin non può intervenire su un ticket già in lavorazione");

    // il divieto vale SOLO quando l'admin sta gestendo un ticket del reparto
    // che non ha creato lui stesso — se è il creatore, valgono le regole base da employee
    cannot("update", "Ticket", ["createdById",], {
      ticketDepartment: user.department,
      // createdById: { not: user.userId },
    }).because("L'admin non può modificare creatore o categoria di un ticket che non ha creato lui stesso");

    can("update", "Ticket", ["categoryId"], {
      ticketDepartment: user.department,
      // createdById: { not: user.userId },
      status: { in: ["OPEN", "ASSIGNED"] },
    });

    can("update", "Ticket", ["priority"], {
      ticketDepartment: user.department,
      status: { in: ["OPEN", "ASSIGNED"] },
    });
  }

  // --- DELETE ---
  can("delete", "Ticket", { createdById: user.userId, status: { in: ["OPEN", "ASSIGNED"] }, });

  return build();
}

export const ALLOWED_STATUS_TRANSITIONS: Partial<
  Record<AccessTokenPayload["role"], Partial<Record<string, string[]>>>
> = {
  TECHNICIAN: { ASSIGNED: ["IN_PROGRESS", "REFUSED"], IN_PROGRESS: ["CLOSED"] },
  ADMIN: { OPEN: ["ASSIGNED", "REFUSED"] },
};