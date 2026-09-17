// apollo-client/queries/ticket-history/ticket-history.fragment.ts
import { graphql } from "@/apollo-client/gql";

export const TICKET_HISTORY_FIELDS = graphql(`
  fragment TicketHistoryFields on TicketHistory {
    id
    originalTicketId
    title
    description
    status
    priority
    dueDate
    dueFirstResponse
    reopenCount
    reopenReason
    sourceDepartmentForUser
    category {
      id
      name
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
    ticketDepartment
    lastUpdatedBy {
      id
      firstName
      lastName
    }
    closingMessage
    ticketSpecific
    deletedAt
    deletedBy {
      id
      firstName
      lastName
    }
  }
`);