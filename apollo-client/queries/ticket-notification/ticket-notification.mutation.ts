// apollo-client/queries/ticket-notification/ticket-notification.mutation.ts
import { graphql } from "@/graphql-generated";

export const CLEAR_TICKET_NOTIFICATIONS = graphql(`
  mutation ClearTicketNotifications($ticketId: Int!) {
    clearTicketNotifications(ticketId: $ticketId)
  }
`);