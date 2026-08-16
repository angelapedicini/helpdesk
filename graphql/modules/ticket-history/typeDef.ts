import { makeConnectionTypeDefs } from "@/graphql/pagination/typeDefs";
import { DateTypeDefinition } from "graphql-scalars";

export const ticketHistoryTypeDefs = `#graphql
  ${DateTypeDefinition}

  ${makeConnectionTypeDefs("TicketHistory")}

  type TicketSnapshot {
    id: Int!
    title: String!
    description: String!
    status: TicketStatus!
    priority: TicketPriority!
    category: TicketCategory
    createdBy: User!
    assignedTo: User
    createdAt: Date!
    updatedAt: Date!
    closedAt: Date
    dueDate: Date
    deletedAt: Date
    sourceDepartmentForUser: Department!
    ticketDepartment: Department!
    lastUpdatedBy: User
    closingMessage: String
  }

  type TicketHistory {
    id: Int!
    ticketId: Int!
    createdAt: Date!
    snapshotBefore: TicketSnapshot!
  }

  extend type Query {
    ticketHistory(
      ticketId: Int!
      first: Int
      after: String
    ): TicketHistoryConnection!
  }
`;