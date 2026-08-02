// lib/apollo-client/queries/ticket/ticket.mutations.ts
import { graphql } from "@/lib/gql";

export const CREATE_TICKET = graphql(`
  mutation CreateTicket($input: TicketInput!) {
    createTicket(input: $input) {
      id
      title
      description
      status
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
    }
  }
`);