// apollo-client/queries/ticket-message/ticket-message.mutation.ts
import { graphql } from "@/graphql-generated";

export const CREATE_TICKET_MESSAGE = graphql(`
  mutation CreateTicketMessage($input: TicketMessageInput!) {
    createTicketMessage(input: $input) {
      id
      content
      ticketId
      createdAt
      author {
        id
        firstName
        lastName
        role
      }
      ticket {
        id
        status
        createdBy { id }
        assignedTo { id }
        category { id }
        ticketDepartment
      }
    }
  }
`);