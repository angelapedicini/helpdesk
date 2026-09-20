import type { Department, TicketSpecificField } from "@/graphql-generated/schema";

export const SPECIFIC_FIELDS_BY_DEPARTMENT: Record<Department, TicketSpecificField[]> = {
  IT: ["HARDWARE_TYPE", "SOFTWARE"],
  HR: ["PAYROLL_REFERENCE", "EMPLOYEE_REFERENCE"],
  FINANCE: ["CUSTOMER", "INVOICE_REFERENCE", "BUDGET_TYPE"],
  SUPPORT: ["CUSTOMER"],
  LOGISTIC: ["CUSTOMER", "SHIPMENT_REFERENCE"],
};

export const SPECIFIC_FIELD_LABELS: Record<TicketSpecificField, string> = {
  HARDWARE_TYPE: "Tipo hardware",
  SOFTWARE: "Software",
  PAYROLL_REFERENCE: "Riferimento busta paga",
  EMPLOYEE_REFERENCE: "Riferimento dipendente",
  CUSTOMER: "Cliente",
  INVOICE_REFERENCE: "Riferimento fattura",
  BUDGET_TYPE: "Tipo di budget",
  SHIPMENT_REFERENCE: "Riferimento spedizione",
};

export function getSpecificFieldsForDepartment(department: Department): TicketSpecificField[] {
  return SPECIFIC_FIELDS_BY_DEPARTMENT[department] ?? [];
}