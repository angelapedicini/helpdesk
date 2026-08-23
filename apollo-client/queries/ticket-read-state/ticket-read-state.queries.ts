// apollo-client/queries/ticket-read-state/ticket-read-state.queries.ts
import { graphql } from "@/apollo-client/gql";

export const UNREAD_TICKET_MESSAGES = graphql(`
  query UnreadTicketMessages {
    unreadTicketMessages {
      ticketId
      count
    }
  }
`);