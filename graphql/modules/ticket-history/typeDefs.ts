// modules/ticket/typeDefs.ts
import { DateTypeDefinition } from "graphql-scalars";
export const ticketTypeDefs = `#graphql
  ${DateTypeDefinition}

  type TicketHistory {
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
  ticketHisotry(
    first: Int
    after: String
    filter: TicketFilter
  ): TicketConnection!

  ticket(id: Int!): Ticket
}

`;