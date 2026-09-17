import { z } from "zod";
import {
  BudgetType as BudgetTypeValues,
  Customer as CustomerValues,
  Department as DepartmentValues,
  HardwareType as HardwareTypeValues,
  Role as RoleValues,
  Software as SoftwareValues,
  TicketPriority as TicketPriorityValues,
  TicketSpecificField as TicketSpecificFieldValues,
  TicketStatus as TicketStatusValues,
} from "@/graphql-generated/schema";

function enumValues<T extends string>(values: readonly T[]): [T, ...T[]] {
  return values as [T, ...T[]];
}

export const TicketPrioritySchema = z.enum(enumValues(Object.values(TicketPriorityValues)));
export type TicketPriority = z.infer<typeof TicketPrioritySchema>;

export const DepartmentEnum = z.enum(enumValues(Object.values(DepartmentValues)));
export type Department = z.infer<typeof DepartmentEnum>;

export const TicketStatusSchema = z.enum(enumValues(Object.values(TicketStatusValues)));
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const RoleEnum = z.enum(enumValues(Object.values(RoleValues)));
export type Role = z.infer<typeof RoleEnum>;

export const HardwareTypeSchema = z.enum(enumValues(Object.values(HardwareTypeValues)));
export type HardwareType = z.infer<typeof HardwareTypeSchema>;

export const SoftwareSchema = z.enum(enumValues(Object.values(SoftwareValues)));
export type Software = z.infer<typeof SoftwareSchema>;

export const CustomerSchema = z.enum(enumValues(Object.values(CustomerValues)));
export type Customer = z.infer<typeof CustomerSchema>;

export const BudgetTypeSchema = z.enum(enumValues(Object.values(BudgetTypeValues)));
export type BudgetType = z.infer<typeof BudgetTypeSchema>;

export const TicketSpecificFieldSchema = z.enum(enumValues(Object.values(TicketSpecificFieldValues)));
export type TicketSpecificField = z.infer<typeof TicketSpecificFieldSchema>;