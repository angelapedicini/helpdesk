// modules/ticket/typeDefs.ts
import { makeConnectionTypeDefs } from "@/graphql/pagination/typeDefs";
import { makeSortTypeDefs } from "@/graphql/sorting/sort-typeDefs";
import { DateTypeDefinition } from "graphql-scalars";
export const ticketTypeDefs = `#graphql
  ${DateTypeDefinition}

  
  ${makeConnectionTypeDefs("Ticket")}
  ${makeSortTypeDefs("Ticket", [
  "ID",
  "TITLE",
  "DESCRIPTION",
  "STATUS",
  "PRIORITY",
  "CATEGORY",
  "DEPARTMENT",
  "CREATED_BY",
  "ASSIGNED_TO",
  "CREATED_AT",
  "UPDATED_AT",
  "CLOSED_AT",
])}

  enum TicketStatus { 
    OPEN 
    ASSIGNED
    IN_PROGRESS 
    CLOSED 
    REFUSED
  }

  enum TicketPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum TicketScope {
    MINE
    ASSIGNED_TO_ME
    DEPARTMENT
  }

  type Ticket {
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

  input TicketInput {
    title: String!
    description: String!
    categoryId: Int
    priority: TicketPriority!
    department: Department!
  }

  input TicketFilter {
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
  tickets(
    first: Int
    after: String
    orderBy: TicketOrderBy
    filter: TicketFilter
    scope: TicketScope = MINE
  ): TicketConnection!

  ticket(id: Int!): Ticket
}

input TicketUpdateInput {
    title: String
    description: String
    status: TicketStatus
    priority: TicketPriority
    categoryId: Int
    assignedToId: Int
    closingMessage: String
    dueDate: Date
}


  type Mutation {
    createTicket(input: TicketInput!): Ticket!
    updateTicket(id: Int!, input: TicketUpdateInput!): Ticket!
    deleteTicket(id: Int!): Ticket!
  }
`;