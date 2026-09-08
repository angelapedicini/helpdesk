// modules/ticket/typeDefs.ts
import { DateTypeDefinition } from "graphql-scalars";
import { makeConnectionTypeDefs } from "@/graphql/pagination/typeDefs";

export const ticketHistoryTypeDefs = `#graphql
  ${DateTypeDefinition}
  ${makeConnectionTypeDefs("TicketHistory")}


  type TicketHistory {
    id: Int!
    originalTicketId: Int!
    title: String!
    description: String!
    status: TicketStatus!
    priority: TicketPriority!
    category: TicketCategory
    createdBy: User
    assignedTo: User
    createdAt: Date!
    updatedAt: Date!
    closedAt: Date
    dueDate: Date
    sourceDepartmentForUser: Department!
    ticketDepartment: Department!
    lastUpdatedBy: User
    closingMessage: String
    ticketSpecific: String
    deletedAt: Date
    deletedBy: User
  }

  input TicketHistoryFilter {
    createdById: Int
    assignedToId: Int
    status: TicketStatus
    categoryId: Int
    priority: TicketPriority

    overdue: Boolean
    unassigned: Boolean

    dueDateFrom: Date
    dueDateTo: Date
  }

type Query {
  ticketHistory(
    first: Int
    after: String
    filter: TicketHistoryFilter
  ): TicketHistoryConnection!

  ticketHistoryByTicketId(
    ticketId: Int!
    first: Int
    after: String
    filter: TicketHistoryFilter
  ): TicketHistoryConnection!

  deletedTickets(
    first: Int
    after: String
    filter: TicketHistoryFilter
    scope: TicketScope
  ): TicketHistoryConnection!
}
`;