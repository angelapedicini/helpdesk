// modules/ticket/typeDefs.ts
import { makeConnectionTypeDefs } from "@/graphql/pagination/typeDefs";
import { makeSortTypeDefs } from "@/graphql/sorting/sort-typeDefs";
import { DateTypeDefinition } from "graphql-scalars";

export const ticketTypeDefs = `#graphql
  ${DateTypeDefinition}

  enum TicketStatus { OPEN IN_PROGRESS CLOSED }

  type Ticket {
    id: Int!
    title: String!
    description: String!
    status: TicketStatus!
    category: TicketCategory!
    createdBy: User!
    assignedTo: User
    createdAt: Date!
    updatedAt: Date!
    closedAt: Date
  }

    input TicketInput {
    title: String!
    description: String!
    categoryId: Int!
    assignedToId: Int
  }

  input TicketFilter {
  createdById: Int
  assignedToId: Int
  status: TicketStatus
  categoryId: Int
}

type Query {
  tickets(first: Int, after: String, orderBy: TicketOrderBy, filter: TicketFilter): TicketConnection!
}

  ${makeConnectionTypeDefs("Ticket")}
  ${makeSortTypeDefs("Ticket", [
  "ID",
  "TITLE",
  "DESCRIPTION",
  "STATUS",
  "CATEGORY",
  "DEPARTMENT",
  "CREATED_BY",
  "ASSIGNED_TO",
  "CREATED_AT",
  "UPDATED_AT",
  "CLOSED_AT",
])}

  # type Query {
  #   tickets(first: Int, after: String, orderBy: TicketOrderBy): TicketConnection!
  # }

    type Mutation {
    createTicket(input: TicketInput!): Ticket!
  }
`;