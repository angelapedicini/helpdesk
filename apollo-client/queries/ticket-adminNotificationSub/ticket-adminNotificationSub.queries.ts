import { graphql } from "@/graphql-generated";

export const GET_TICKET_NOTIFICATION_SUBSCRIPTION = graphql(`
  query TicketNotificationSubscription($ticketId: Int!) {
    ticketNotificationSubscription(ticketId: $ticketId) {
      userId
      ticketId
    }
  }
`);