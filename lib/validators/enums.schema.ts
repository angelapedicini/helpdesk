import { z } from "zod";

export const TicketPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const DepartmentEnum = z.enum(["HR", "IT", "FINANCE", "SALES", "MARKETING"]);

export type Department = z.infer<typeof DepartmentEnum>;

export const TicketStatusSchema = z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "CLOSED", "REFUSED"]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export type TicketPriority = z.infer<typeof TicketPrioritySchema>;

export const RoleEnum = z.enum(["ADMIN", "TECHNICIAN", "EMPLOYEE"]);
export type Role = z.infer<typeof RoleEnum>;