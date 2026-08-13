// modules/ticket/resolvers/where.ts

import type { Prisma } from "@/app/generated/prisma/client";
import { GraphQLError } from "graphql/error";
import { AccessTokenPayload } from "@/lib/auth/jwt";
import { FilterTicketSchema } from "@/lib/validators/ticket-detail.schema";

export type TicketSortField =
  | "ID"
  | "TITLE"
  | "DESCRIPTION"
  | "STATUS"
  | "PRIORITY"
  | "CATEGORY"
  | "DEPARTMENT"
  | "CREATED_BY"
  | "ASSIGNED_TO"
  | "CREATED_AT"
  | "UPDATED_AT"
  | "CLOSED_AT";

export const TICKET_SORT_FIELD_MAP: Record<TicketSortField, string> = {
  ID: "id",
  TITLE: "title",
  DESCRIPTION: "description",
  STATUS: "status",
  PRIORITY: "priority",
  CATEGORY: "category.name",
  DEPARTMENT: "ticketDepartment",
  CREATED_BY: "createdBy.firstName",
  ASSIGNED_TO: "assignedTo.firstName",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  CLOSED_AT: "closedAt",
};

export type TicketScope =
  | "MINE"
  | "ASSIGNED_TO_ME"
  | "DEPARTMENT";

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
  switch (scope) {
    case "MINE":
      return {
        createdById: session.userId,
      };

    case "ASSIGNED_TO_ME":
      if (session.role !== "TECHNICIAN") {
        throw new GraphQLError(
          "Vista non disponibile per il tuo ruolo",
          {
            extensions: {
              code: "FORBIDDEN",
            },
          }
        );
      }

      return {
        assignedToId: session.userId,
      };

    case "DEPARTMENT":
      if (session.role !== "ADMIN") {
        throw new GraphQLError(
          "Vista non disponibile per il tuo ruolo",
          {
            extensions: {
              code: "FORBIDDEN",
            },
          }
        );
      }

      return {
        ticketDepartment: session.department,
      };

    default: {
      const _exhaustive: never = scope;

      throw new GraphQLError("Scope non valido", {
        extensions: {
          code: "BAD_USER_INPUT",
        },
      });
    }
  }
}