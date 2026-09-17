// apollo-client/queries/ticket-message/ticket-message.mutation.ts
import { graphql } from "@/graphql-generated";

export const SUBSCRIBE_TO_TICKET_NOTIFICATIONS = graphql(`
  mutation CreateTicketNotificationSubscription($ticketId: Int!) {
    createTicketNotificationSubscription(ticketId: $ticketId) {
      userId
      ticketId
    }
  }
`);

export const UNSUBSCRIBE_FROM_TICKET_NOTIFICATIONS = graphql(`
  mutation DeleteTicketNotificationSubscription($ticketId: Int!) {
    deleteTicketNotificationSubscription(ticketId: $ticketId) {
      userId
      ticketId
    }
  }
`);