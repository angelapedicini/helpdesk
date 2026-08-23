import { graphql } from "@/apollo-client/gql";

export const GET_TICKET_NOTIFICATION_SUBSCRIPTION = graphql(`
  query TicketNotificationSubscription($ticketId: Int!) {
    ticketNotificationSubscription(ticketId: $ticketId) {
      userId
      ticketId
    }
  }
`);