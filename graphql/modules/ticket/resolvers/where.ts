// modules/ticket/resolvers/where.ts

import type { Prisma } from "@/app/generated/prisma/client";
import { GraphQLError } from "graphql/error";
import { AccessTokenPayload } from "@/lib/auth/jwt";
import { FilterTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { alertDueSoonHorizon } from "@/lib/ticket/dueDate";
import type { TicketScope, TicketSortField } from "@/graphql-generated/schema";
import { defineAbility } from "@/lib/casl/defineAbility";
import { assertCanReadTicketScope } from "@/lib/casl/abilities/ticket-scope/guards";

export const TICKET_SORT_FIELD_MAP: Record<TicketSortField, string> = {
  ID: "id",
  TITLE: "title",
  DESCRIPTION: "description",
  STATUS: "status",
  PRIORITY: "priority",
  CATEGORY: "category.id",        
  DEPARTMENT: "ticketDepartment",
  CREATED_BY: "createdBy.firstName",
  ASSIGNED_TO: "assignedTo.firstName",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  CLOSED_AT: "closedAt",
  DUE_FIRST_RESPONSE: "dueFirstResponse",
  DUE_DATE: "dueDate"
};

export function buildTicketWhere(
  rawFilter: unknown
): Prisma.TicketWhereInput {
  if (!rawFilter) return {};

  const result = FilterTicketSchema.safeParse(rawFilter);

  if (!result.success) {
    throw new GraphQLError("Filtro non valido", {
      extensions: {
        code: "BAD_USER_INPUT",
        issues: result.error.flatten(),
      },
    });
  }

  const filter = result.data;

  const conditions: Prisma.TicketWhereInput[] = [];

  // Finestra "in scadenza" (ora + ALERT_DUE_SOON_DAYS): usata insieme dai
  // filtri firstResponseDueSoon e dueDateDueSoon.
  const now = new Date();
  const dueSoonHorizon = alertDueSoonHorizon(now);

  // Creatore
  if (filter.createdById !== undefined) {
    conditions.push({
      createdById: filter.createdById,
    });
  }

  // Assegnatario
  if (filter.assignedToId !== undefined) {
    conditions.push({
      assignedToId: filter.assignedToId,
    });
  }

  // Stato
  if (filter.status !== undefined) {
    conditions.push({
      status: filter.status,
    });
  }

  // Categoria
  if (filter.categoryId !== undefined) {
    conditions.push({
      categoryId: filter.categoryId,
    });
  }

  // Priorità
  if (filter.priority !== undefined) {
    conditions.push({
      priority: filter.priority,
    });
  }

  // Solo ticket scaduti
  if (filter.overdue === true) {
    conditions.push({
      dueDate: {
        lt: new Date(),
      },
      status: {
        notIn: ["CLOSED", "REFUSED"],
      },
    });
  }

  // Solo ticket con SLA di prima risposta scaduto.
  // Assunzione: una volta che il ticket esce da OPEN/ASSIGNED (es. entra in
  // IN_PROGRESS) si considera "già risposto", quindi il filtro ha senso solo
  // per ticket ancora in quei due stati. Un ticket REOPENED è in attesa di
  // presa in carico come un ASSIGNED (la SLA è ricalcolata alla riapertura),
  // quindi è incluso.
  if (filter.firstResponseOverdue === true) {
    conditions.push({
      dueFirstResponse: {
        lt: new Date(),
      },
      status: {
        in: ["OPEN", "ASSIGNED", "REOPENED"],
      },
    });
  }

  // Solo ticket attualmente REOPENED (diriapeti e ancora da lavorare).
  if (filter.reopened === true) {
    conditions.push({
      status: "REOPENED",
    });
  }

  // Prima risposta in scadenza (non ancora scaduta, ma entro l'orizzonte).
  if (filter.firstResponseDueSoon === true) {
    conditions.push({
      dueFirstResponse: {
        gte: now,
        lte: dueSoonHorizon,
      },
      status: {
        in: ["OPEN", "ASSIGNED", "REOPENED"],
      },
    });
  }

  // Due date in scadenza (entro l'orizzonte).
  if (filter.dueDateDueSoon === true) {
    conditions.push({
      dueDate: {
        gte: now,
        lte: dueSoonHorizon,
      },
      status: {
        notIn: ["CLOSED", "REFUSED"],
      },
    });
  }

  // Solo ticket non assegnati
  if (filter.unassigned === true) {
    conditions.push({
      assignedToId: null,
    });
  }

  // Scadenza da
  if (filter.dueDateFrom !== undefined) {
    conditions.push({
      dueDate: {
        gte: filter.dueDateFrom,
      },
    });
  }

  // Scadenza fino a
  if (filter.dueDateTo !== undefined) {
    conditions.push({
      dueDate: {
        lte: filter.dueDateTo,
      },
    });
  }

  if (conditions.length === 0) {
    return {};
  }

  return {
    AND: conditions,
  };
}
export function buildScopeWhere(
  scope: TicketScope,
  session: AccessTokenPayload
): Prisma.TicketWhereInput {
  const ability = defineAbility(session);
  assertCanReadTicketScope(ability, scope);

  switch (scope) {
    case "MINE":
      return {
        createdById: session.userId,
      };

    case "ASSIGNED_TO_ME":
      return {
        assignedToId: session.userId,
      };

    case "DEPARTMENT":
      return {
        ticketDepartment: session.department,
      };

    case "ALL":
      // nessun filtro di dipartimento: SYSTEM_ADMIN vede tutti i ticket
      return {};

    default: {
      const _exhaustive: never = scope;

      throw new GraphQLError("Scope not valid", {
        extensions: {
          code: "BAD_USER_INPUT",
        },
      });
    }
  }
}