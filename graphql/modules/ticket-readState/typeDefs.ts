export const ticketReadStateTypeDefs = `#graphql
  type TicketReadState {
    userId: Int!
    ticketId: Int!
    lastReadMessageId: Int
    lastReadMessage: TicketMessage
  }

  type TicketUnreadCount {
    ticketId: Int!
    count: Int!
  }

  type Query {
    unreadTicketMessages: [TicketUnreadCount!]!
  }

  type Mutation {
    markTicketMessagesRead(ticketId: Int!): TicketReadState
  }
`;