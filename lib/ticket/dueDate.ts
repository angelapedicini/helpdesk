// lib/ticket/dueDate.ts
import { addBusinessDays } from "date-fns";
import { TicketPriority } from "../validators/enums.schema";

const DUE_DATE_BUSINESS_DAYS_BY_PRIORITY: Record<TicketPriority, number> = {
  URGENT: 3,
  HIGH: 5,
  MEDIUM: 7,
  LOW: 10,
};

export function computeDueDate(priority: TicketPriority, from: Date = new Date()): Date {
  const days = DUE_DATE_BUSINESS_DAYS_BY_PRIORITY[priority];
  return addBusinessDays(from, days);
}