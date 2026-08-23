// modules/ticketMessage/typeDefs.ts
import { makeConnectionTypeDefs } from "@/graphql/pagination/typeDefs";
import { DateTypeDefinition } from "graphql-scalars";

export const ticketMessageTypeDefs = `#graphql
  ${DateTypeDefinition}

  ${makeConnectionTypeDefs("TicketMessage")}

  type TicketMessage {
    id: Int!
    content: String!
    ticketId: Int!
    ticket: Ticket!
    author: User!
    createdAt: Date!
  }

  type Query {
    messages(ticketId: Int!, first: Int, after: String): TicketMessageConnection!
  }

  input TicketMessageInput {
    ticketId: Int!
    content: String!
  }

  type Mutation {
    createTicketMessage(input: TicketMessageInput!): TicketMessage!
    deleteTicketMessage(id: Int!): TicketMessage!
  }
`;