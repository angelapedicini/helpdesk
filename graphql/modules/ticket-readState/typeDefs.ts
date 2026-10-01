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
    # Quando è arrivato l'ultimo dei messaggi contati in count, non quando
    # l'utente ha segnato come letto: quello starebbe in TicketReadState.
    lastMessageAt: Date!
  }

  type Query {
    unreadTicketMessages: [TicketUnreadCount!]!
  }

  type Mutation {
    markTicketMessagesRead(ticketId: Int!): TicketReadState
  }
`;