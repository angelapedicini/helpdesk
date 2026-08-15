import { graphql } from "@/apollo-client/gql";

export const TICKET_FIELDS = graphql(`
  fragment TicketFields on Ticket {
    id
    title
    description
    status
    priority

    category {
      id
      name
      department
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