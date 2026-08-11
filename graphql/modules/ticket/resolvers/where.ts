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

export type TicketScope = "MINE" | "ASSIGNED_TO_ME" | "DEPARTMENT";

export function buildTicketWhere(rawFilter: unknown): Prisma.TicketWhereInput {
  if (!rawFilter) return {};

  const result = FilterTicketSchema.safeParse(rawFilter);
  if (!result.success) {
    throw new GraphQLError("Filtro non valido", {
      extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
    });
  }
  const filter = result.data;

  return {
    ...(filter.createdById && { createdById: filter.createdById }),
    ...(filter.assignedToId && { assignedToId: filter.assignedToId }),
    ...(filter.status && { status: filter.status }),
    ...(filter.categoryId && { categoryId: filter.categoryId }),
    ...(filter.priority && { priority: filter.priority }),
    
  };
}

export function buildScopeWhere(
  scope: TicketScope,
  session: AccessTokenPayload
): Prisma.TicketWhereInput {
  switch (scope) {
    case "MINE":
      return { createdById: session.userId };

    case "ASSIGNED_TO_ME":
      if (session.role !== "TECHNICIAN") {
        throw new GraphQLError("Vista non disponibile per il tuo ruolo", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return { assignedToId: session.userId };

    case "DEPARTMENT":
      if (session.role !== "ADMIN") {
        throw new GraphQLError("Vista non disponibile per il tuo ruolo", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return { sourceDepartmentForUser: session.department };

    default: {
      const _exhaustive: never = scope;
      throw new GraphQLError("Scope non valido", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
  }
}