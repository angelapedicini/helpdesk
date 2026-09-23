export const ticketNotificationTypeDefs = `#graphql
  enum TicketNotificationType {
    NEWTICKET
    STATUS_CHANGED
    ASSIGNED
    CATEGORY_CHANGED
    PRIORITY_CHANGED
    DATES_CHANGED
  }

  type TicketNotification {
    id: Int!
    type: TicketNotificationType!
    updatedAt: Date!
    ticket: Ticket!
  }

  extend type Query {
    ticketNotifications: [TicketNotification!]!
  }

  extend type Mutation {
    clearTicketNotifications(ticketId: Int!): Int!
  }
`;