// apollo-client/queries/ticket-notification/ticket-notification.queries.ts
import { graphql } from "@/graphql-generated";

export const NAV_NOTIFICATIONS = graphql(`
  query NavNotifications {
    unreadTicketMessages {
      ticketId
      count
      lastMessageAt
    }
    ticketNotifications {
      id
      type
      updatedAt
      ticket {
        id
        title
      }
    }
  }
`);