import { graphql } from "@/graphql-generated";

export const TICKET_FIELDS = graphql(`
 fragment TicketFields on Ticket {
    id
    title
    description
    status
    priority

    specificData {
      __typename
      ... on TicketITSpecific {
        hardwareType
        software
      }
      ... on TicketHRSpecific {
        payrollReference
        employeeReference
      }
      ... on TicketFinanceSpecific {
        customer
        invoiceReference
        budgetType
      }
      ... on TicketSupportSpecific {
        customer
      }
      ... on TicketLogisticSpecific {
        customer
        shipmentReference
      }
    }

    category {
      id
      name
      department
      specificField
    }

    createdBy {
      id
      firstName
      lastName
    }

    assignedTo {
      id
      firstName
      lastName
    }

    createdAt
    updatedAt
    closedAt
    dueDate
    dueFirstResponse
    reopenCount
    reopenReason
    sourceDepartmentForUser
    ticketDepartment
    lastUpdatedBy {
      id
      firstName
      lastName
    }
    closingMessage
}
`);