export const ticketSpecificationTypeDefs = `#graphql

type TicketITSpecific {
    hardwareType: HardwareType
    software: Software
}

type TicketHRSpecific {
    payrollReference: String
    employeeReference: String
}

type TicketFinanceSpecific {
    customer: Customer
    invoiceReference: String
    budgetType: BudgetType
}

type TicketSupportSpecific {
    customer: Customer
}

type TicketLogisticSpecific {
    customer: Customer
    shipmentReference: String
}

enum HardwareType {
    LAPTOP,
    DESKTOP,
    MONITOR,
    KEYBOARD,
    MOUSE,
    DOCKING_STATION,
    PRINTER,
    SMARTPHONE,
    TABLET,
    SERVER,
}

enum Software {
    JIRA,
    SLACK,
    MICROSOFT_TEAMS,
    OUTLOOK,
    EXCEL,
    WORD,
    POWERPOINT,
    SAP,
    SALESFORCE,
    GITHUB,
    GITLAB,
    CONFLUENCE,
}

enum Customer {
    ACME,
    MICROSOFT,
    GOOGLE,
    AMAZON,
    APPLE,
    IBM,
    ORACLE,
    SAP,
    DELOITTE,
    ACCENTURE,
}

enum BudgetType {
    NEW_HARDWARE,
    SOFTWARE_LICENSE,
    CLOUD_SERVICES,
    IT_INFRASTRUCTURE,
    OFFICE_EQUIPMENT,
    CONSULTING,
    TRAINING,
    MAINTENANCE,
    SECURITY,
    TRAVEL,
}

enum TicketSpecificField {
    HARDWARE_TYPE
    SOFTWARE
    PAYROLL_REFERENCE
    EMPLOYEE_REFERENCE
    CUSTOMER
    INVOICE_REFERENCE
    BUDGET_TYPE
    SHIPMENT_REFERENCE
}

union TicketSpecific = TicketITSpecific | TicketHRSpecific | TicketFinanceSpecific | TicketSupportSpecific | TicketLogisticSpecific


`
