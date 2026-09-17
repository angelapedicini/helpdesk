// lib/ticket/history.ts
import type { Prisma } from "@/app/generated/prisma/client";

export type TicketHistorySource = Pick<
  Prisma.TicketModel,
  | "id"
  | "title"
  | "description"
  | "status"
  | "priority"
  | "categoryId"
  | "createdById"
  | "assignedToId"
  | "lastUpdatedById"
  | "closingMessage"
  | "sourceDepartmentForUser"
  | "ticketDepartment"
  | "createdAt"
  | "updatedAt"
  | "dueFirstResponse"
  | "dueDate"
  | "closedAt"
  | "reopenCount"
  | "reopenReason"
>;

export type TicketHistoryOptions = {
  ticketSpecific: string | null;
  lastUpdatedById?: number | null;
  updatedAt?: Date;
  deletedAt?: Date | null;
  deletedById?: number | null;
};

export function buildTicketHistoryData(
  source: TicketHistorySource,
  options: TicketHistoryOptions
): Prisma.TicketHistoryUncheckedCreateInput {
  return {
    originalTicketId: source.id,
    title: source.title,
    description: source.description,
    status: source.status,
    priority: source.priority,
    categoryId: source.categoryId,
    createdById: source.createdById,
    assignedToId: source.assignedToId,
    lastUpdatedById: options.lastUpdatedById ?? source.lastUpdatedById,
    closingMessage: source.closingMessage,
    sourceDepartmentForUser: source.sourceDepartmentForUser,
    ticketDepartment: source.ticketDepartment,
    ticketSpecific: options.ticketSpecific,
    createdAt: source.createdAt,
    updatedAt: options.updatedAt ?? source.updatedAt,
    dueFirstResponse: source.dueFirstResponse,
    dueDate: source.dueDate,
    closedAt: source.closedAt,
    deletedAt: options.deletedAt ?? null,
    deletedById: options.deletedById ?? null,
    reopenCount: source.reopenCount,
    reopenReason: source.reopenReason,
  };
}