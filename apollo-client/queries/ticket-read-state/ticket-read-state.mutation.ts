// apollo-client/queries/ticket-read-state/ticket-read-state.mutation.ts
import { graphql } from "@/apollo-client/gql";

export const MARK_TICKET_MESSAGES_READ = graphql(`
  mutation MarkTicketMessagesRead($ticketId: Int!) {
    markTicketMessagesRead(ticketId: $ticketId) {
      userId
      ticketId
      lastReadMessageId
      lastReadMessage {
        id
        content
        createdAt
      }
    }
  }
`);