// modules/ticket/resolvers/where.ts

import type { Prisma } from "@/app/generated/prisma/client";
import { GraphQLError } from "graphql/error";
import { AccessTokenPayload } from "@/lib/auth/jwt";
import { FilterTicketSchema } from "@/lib/validators/ticket-detail.schema";

export function buildTicketWhere(
  rawFilter: unknown
): Prisma.TicketHistory2WhereInput {
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

  const conditions: Prisma.TicketHistory2WhereInput[] = [];

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
