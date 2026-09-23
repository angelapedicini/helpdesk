import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import type { TicketAbility } from "./types";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

export function defineAbilityForTicket(user: AccessTokenPayload): TicketAbility {
  const { can, cannot, build } = new AbilityBuilder<TicketAbility>(createPrismaAbility);

  // ============================================================
  // Ticket
  // ============================================================

  const BASE_CREATE_FIELDS = [
    "title",
    "description",
    "categoryId",
    "priority",
    "department",
  ] as const;

  // ------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------

  // Tutti gli utenti possono creare un ticket specificando
  // solamente i campi base.
  can("create", "Ticket", [...BASE_CREATE_FIELDS]);

  // Il technician può impostare l'assegnatario direttamente
  // durante la creazione, ma solo per ticket appartenenti
  // al proprio dipartimento.
  if (user.role === "TECHNICIAN") {
    can("create", "Ticket", "assignedToId", {
      ticketDepartment: user.department,
    });
  }

  // ------------------------------------------------------------
  // READ
  // ------------------------------------------------------------
  // nessuna condizione = tutti i ticket, tutti i dipartimenti
  if (user.role === "SYSTEM_ADMIN") {
    can("read", "Ticket");
  }
  // Ogni utente può leggere solamente i ticket che ha creato.
  can("read", "Ticket", {
    createdById: user.userId,
  });

  // Il technician può leggere anche i ticket che gli sono stati
  // assegnati, oltre a quelli creati personalmente.
  if (user.role === "TECHNICIAN") {
    can("read", "Ticket", {
      assignedToId: user.userId,
    });
  }

  // L'admin può leggere tutti i ticket appartenenti
  // al proprio dipartimento.
  if (user.role === "ADMIN") {
    can("read", "Ticket", {
      ticketDepartment: user.department,
    });
  }

  // ------------------------------------------------------------
  // UPDATE - Regole comuni al creatore
  // ------------------------------------------------------------

  // Il creatore può modificare titolo, descrizione e priorità
  // finché il ticket è OPEN o ASSIGNED.
  can("update", "Ticket", ["title", "description", "priority"], {
    createdById: user.userId,
    status: { in: ["OPEN", "ASSIGNED"] },
  });

  // Il creatore può modificare categoria e valore specifico
  // finché il ticket è OPEN o ASSIGNED.
  can("update", "Ticket", ["categoryId", "specificValue"], {
    createdById: user.userId,
    status: { in: ["OPEN", "ASSIGNED"] },
  });

  // Il creatore può riaprire un ticket CLOSED (status -> REOPENED),
  // indicando il motivo della riapertura.
  can("update", "Ticket", ["status", "reopenReason", "closedAt"], {
    createdById: user.userId,
    status: "CLOSED",
  });

  // Anche l'assegnatario può riaprire un ticket CLOSED.
  can("update", "Ticket", ["status", "reopenReason", "closedAt"], {
    assignedToId: user.userId,
    status: "CLOSED",
  });

  // ------------------------------------------------------------
  // UPDATE - Technician
  // ------------------------------------------------------------

  if (user.role === "TECHNICIAN") {
    // Il technician assegnatario può prendere in carico il ticket
    // passando da ASSIGNED (o REOPENED, un ticket riaperto resta
    // assegnato) a IN_PROGRESS oppure REFUSED.
    can(
      "update",
      "Ticket",
      ["status", "closingMessage"],
      {
        assignedToId: user.userId,
        status: { in: ["ASSIGNED", "REOPENED"] },
      },
    );

    // Il technician assegnatario può chiudere il ticket
    // quando questo è IN_PROGRESS.
    can(
      "update",
      "Ticket",
      ["status", "closedAt", "closingMessage"],
      {
        assignedToId: user.userId,
        status: "IN_PROGRESS",
      },
    );

    // Il technician assegnatario può modificare la scadenza
    // quando il ticket è ASSIGNED o IN_PROGRESS.
    can("update", "Ticket", ["dueDate"], {
      assignedToId: user.userId,
      status: { in: ["ASSIGNED", "IN_PROGRESS"] },
    });

    // Il technician può modificare l'assegnatario solamente
    // sui ticket che sono già assegnati a lui e ancora
    // in stato ASSIGNED o IN_PROGRESS.
    can("update", "Ticket", ["assignedToId"], {
      assignedToId: user.userId,
      status: { in: ["ASSIGNED", "IN_PROGRESS"] },
    });

    // Il technician non può modificare il creatore
    // di un ticket che gli è stato assegnato.
    cannot("update", "Ticket", ["createdById"], {
      assignedToId: user.userId,
    }).because(
      "Il technician non può modificare creatore di un ticket assegnatogli",
    );
  }

  // ------------------------------------------------------------
  // UPDATE - Admin
  // ------------------------------------------------------------

  if (user.role === "ADMIN") {
    // L'admin può sfogliare l'elenco completo dei tecnici del proprio
    // dipartimento (invece della ricerca testuale) quando il ticket è OPEN:
    // è una capability di presentazione, non un permesso di modifica.
    can("browseAssignees", "Ticket", {
      ticketDepartment: user.department,
      status: "OPEN",
    });

    // L'admin può modificare l'assegnatario dei ticket
    // appartenenti al proprio dipartimento, finché sono
    // OPEN o ASSIGNED.
    can("update", "Ticket", ["assignedToId"], {
      ticketDepartment: user.department,
      status: { in: ["OPEN", "ASSIGNED"] },
    });

    // L'admin può modificare lo stato e il messaggio di chiusura
    // dei ticket OPEN del proprio dipartimento.
    can("update", "Ticket", ["status", "closingMessage"], {
      ticketDepartment: user.department,
      status: "OPEN",
    });

    // L'admin non può intervenire sullo stato di un ticket
    // che è già IN_PROGRESS o CLOSED.
    cannot("update", "Ticket", ["status"], {
      status: { in: ["IN_PROGRESS", "CLOSED"] },
    }).because(
      "L'admin non può intervenire su un ticket già in lavorazione",
    );

    // L'admin non può modificare il creatore di un ticket
    // appartenente al proprio dipartimento.
    cannot("update", "Ticket", ["createdById"], {
      ticketDepartment: user.department,
    }).because(
      "L'admin non può modificare creatore o categoria di un ticket che non ha creato lui stesso",
    );

    // L'admin può modificare categoria e valore specifico
    // dei ticket del proprio dipartimento, solamente quando
    // il ticket è OPEN.
    can("update", "Ticket", ["categoryId", "specificValue"], {
      ticketDepartment: user.department,
      status: "OPEN",
    });

    // L'admin può modificare la priorità dei ticket
    // del proprio dipartimento, finché sono OPEN o ASSIGNED.
    can("update", "Ticket", ["priority"], {
      ticketDepartment: user.department,
      status: { in: ["OPEN", "ASSIGNED"] },
    });
  }

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------

  // Il creatore può eliminare il proprio ticket solamente
  // finché questo è OPEN o ASSIGNED.
  can("delete", "Ticket", {
    createdById: user.userId,
    status: { in: ["OPEN", "ASSIGNED"] },
  });

  // ============================================================
  // TicketMessage
  // ============================================================

  // ------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------

  // Il creatore del ticket può aggiungere messaggi solamente
  // finché il ticket non è CLOSED o REFUSED.
  can("create", "TicketMessage", {
    "ticket.createdById": user.userId,
    "ticket.status": { notIn: ["CLOSED", "REFUSED"] },
  });

  // Il technician può aggiungere messaggi solamente ai ticket
  // a lui assegnati e che sono ASSIGNED o IN_PROGRESS.
  if (user.role === "TECHNICIAN") {
    can("create", "TicketMessage", {
      "ticket.assignedToId": user.userId,
      "ticket.status": { in: ["ASSIGNED", "IN_PROGRESS"] },
    });
  }

  // L'admin può aggiungere messaggi ai ticket del proprio
  // dipartimento finché non sono CLOSED o REFUSED.
  if (user.role === "ADMIN") {
    can("create", "TicketMessage", {
      "ticket.ticketDepartment": user.department,
      "ticket.status": { notIn: ["CLOSED", "REFUSED"] },
    });
  }

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------

  // Ogni utente può eliminare solamente i messaggi
  // di cui è autore.
  can("delete", "TicketMessage", {
    authorId: user.userId,
  });

  return build();
}

// ============================================================
// Ticket status transitions
// ============================================================

export const ALLOWED_STATUS_TRANSITIONS: Partial<
  Record<
    AccessTokenPayload["role"],
    Partial<Record<string, string[]>>
  >
> = {
  // Qualsiasi ruolo può essere creatore o assegnatario di un ticket:
  // chi di loro può riaprire un ticket CLOSED portandolo a REOPENED.
  EMPLOYEE: {
    CLOSED: ["REOPENED"],
  },
  SYSTEM_ADMIN: {
    CLOSED: ["REOPENED"],
  },

  // Il technician può prendere in carico o rifiutare un ticket
  // ASSIGNED o REOPENED (un ticket riaperto resta assegnato).
  // Un ticket IN_PROGRESS può invece essere chiuso.
  TECHNICIAN: {
    ASSIGNED: ["IN_PROGRESS", "REFUSED"],
    REOPENED: ["IN_PROGRESS", "REFUSED"],
    IN_PROGRESS: ["CLOSED"],
    CLOSED: ["REOPENED"],
  },

  // L'admin può assegnare o rifiutare un ticket OPEN.
  ADMIN: {
    OPEN: ["ASSIGNED", "REFUSED"],
    CLOSED: ["REOPENED"],
  },
};
