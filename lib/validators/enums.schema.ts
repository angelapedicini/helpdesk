import { z } from "zod";

export const TicketPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const DepartmentEnum = z.enum(["HR", "IT", "FINANCE", "SUPPORT", "LOGISTIC"]);
export type Department = z.infer<typeof DepartmentEnum>;

export const TicketStatusSchema = z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "CLOSED", "REFUSED"]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export type TicketPriority = z.infer<typeof TicketPrioritySchema>;

export const RoleEnum = z.enum(["ADMIN", "TECHNICIAN", "EMPLOYEE"]);
export type Role = z.infer<typeof RoleEnum>;

export const HardwareTypeSchema = z.enum([
  "LAPTOP",
  "DESKTOP",
  "MONITOR",
  "KEYBOARD",
  "MOUSE",
  "DOCKING_STATION",
  "PRINTER",
  "SMARTPHONE",
  "TABLET",
  "SERVER",
]);
export type HardwareType = z.infer<typeof HardwareTypeSchema>;

export const SoftwareSchema = z.enum([
  "JIRA",
  "SLACK",
  "MICROSOFT_TEAMS",
  "OUTLOOK",
  "EXCEL",
  "WORD",
  "POWERPOINT",
  "SAP",
  "SALESFORCE",
  "GITHUB",
  "GITLAB",
  "CONFLUENCE",
]);
export type Software = z.infer<typeof SoftwareSchema>;

export const CustomerSchema = z.enum([
  "ACME",
  "MICROSOFT",
  "GOOGLE",
  "AMAZON",
  "APPLE",
  "IBM",
  "ORACLE",
  "SAP",
  "DELOITTE",
  "ACCENTURE",
]);
export type Customer = z.infer<typeof CustomerSchema>;

export const BudgetTypeSchema = z.enum([
  "NEW_HARDWARE",
  "SOFTWARE_LICENSE",
  "CLOUD_SERVICES",
  "IT_INFRASTRUCTURE",
  "OFFICE_EQUIPMENT",
  "CONSULTING",
  "TRAINING",
  "MAINTENANCE",
  "SECURITY",
  "TRAVEL",
]);
export type BudgetType = z.infer<typeof BudgetTypeSchema>;

export const TicketSpecificFieldSchema = z.enum([
  "HARDWARE_TYPE",
  "SOFTWARE",
  "PAYROLL_REFERENCE",
  "EMPLOYEE_REFERENCE",
  "CUSTOMER",
  "INVOICE_REFERENCE",
  "BUDGET_TYPE",
  "SHIPMENT_REFERENCE",
]);
export type TicketSpecificField = z.infer<typeof TicketSpecificFieldSchema>;