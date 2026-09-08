// modules/ticket/resolvers/where.ts

import type { Prisma } from "@/app/generated/prisma/client";
import { GraphQLError } from "graphql/error";
import { AccessTokenPayload } from "@/lib/auth/jwt";
import { FilterTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { TicketScope } from "../../ticket/resolvers/where";

export function buildTicketWhere(
  rawFilter: unknown
): Prisma.TicketHistoryWhereInput {
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

  const conditions: Prisma.TicketHistoryWhereInput[] = [];

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

export function buildHistoryScopeWhere(
  scope: TicketScope,
  session: AccessTokenPayload
): Prisma.TicketHistoryWhereInput {
  switch (scope) {
    case "MINE":
      return {
        createdById: session.userId,
      };

    case "ASSIGNED_TO_ME":
      if (session.role !== "TECHNICIAN") {
        throw new GraphQLError(
          "View not available to role",
          { extensions: { code: "FORBIDDEN" } }
        );
      }

      return {
        assignedToId: session.userId,
      };

    case "DEPARTMENT":
      if (session.role !== "ADMIN") {
        throw new GraphQLError(
          "View not available to role",
          { extensions: { code: "FORBIDDEN" } }
        );
      }

      return {
        ticketDepartment: session.department,
      };

    default: {
      const _exhaustive: never = scope;

      throw new GraphQLError("Scope not valid", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
  }
}
