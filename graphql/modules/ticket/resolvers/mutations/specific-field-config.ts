import {
  Department,
  TicketSpecificField,
  HardwareType,
  Software,
  Customer,
  BudgetType,
} from "@/app/generated/prisma/enums";

type SpecificMappingRow = {
  department: Department;
  specific: TicketSpecificField;
  tb: "itSpecific" | "hrSpecific" | "financeSpecific" | "supportSpecific" | "logisticSpecific";
  field: string;
  values?: readonly string[];
};

const SPECIFIC_FIELD_MAP: SpecificMappingRow[] = [
  { department: "IT", specific: "HARDWARE_TYPE", tb: "itSpecific", field: "hardwareType",
    values: Object.values(HardwareType) },
  { department: "IT", specific: "SOFTWARE", tb: "itSpecific", field: "software",
    values: Object.values(Software) },

  { department: "HR", specific: "PAYROLL_REFERENCE", tb: "hrSpecific", field: "payrollReference" },

  { department: "FINANCE", specific: "CUSTOMER", tb: "financeSpecific", field: "customer",
    values: Object.values(Customer) },
  { department: "FINANCE", specific: "INVOICE_REFERENCE", tb: "financeSpecific", field: "invoiceReference" },
  { department: "FINANCE", specific: "BUDGET_TYPE", tb: "financeSpecific", field: "budgetType",
    values: Object.values(BudgetType) },

  { department: "SUPPORT", specific: "CUSTOMER", tb: "supportSpecific", field: "customer",
    values: Object.values(Customer) },

  { department: "LOGISTIC", specific: "CUSTOMER", tb: "logisticSpecific", field: "customer",
    values: Object.values(Customer) },
  { department: "LOGISTIC", specific: "SHIPMENT_REFERENCE", tb: "logisticSpecific", field: "shipmentReference" },
];

export function getSpecificMapping(
  department: Department,
  field: TicketSpecificField
): SpecificMappingRow {
  const mapping = SPECIFIC_FIELD_MAP.find(
    (row) => row.department === department && row.specific === field
  );
  if (!mapping) {
    throw new Error(`Combinazione dipartimento/campo non valida: ${department}/${field}`);
  }
  return mapping;
}

// da aggiungere in modules/ticket/resolvers/mutations/specific-field-config.ts

// Restituisce tutti i nomi di campo noti per una data tabella specifica
// (es. "itSpecific" -> ["hardwareType", "software"]), usato per azzerare
// i campi non più pertinenti quando lo specificField cambia restando
// sulla stessa tabella/dipartimento.
export function getFieldsForTable(tb: SpecificMappingRow["tb"]): string[] {
  return [...new Set(SPECIFIC_FIELD_MAP.filter((row) => row.tb === tb).map((row) => row.field))];
}