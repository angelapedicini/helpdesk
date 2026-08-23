export const ticketAdminNotificationSubTypeDefs = `#graphql
  type TicketAdminNotificationSubscription {
    userId: Int!
    ticketId: Int!
  }

  type Query {
    ticketNotificationSubscription(ticketId: Int!): TicketAdminNotificationSubscription
  }

  type Mutation {
    createTicketNotificationSubscription(ticketId: Int!): TicketAdminNotificationSubscription!
    deleteTicketNotificationSubscription(ticketId: Int!): TicketAdminNotificationSubscription!
  }
`;