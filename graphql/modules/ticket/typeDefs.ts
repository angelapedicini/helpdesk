// modules/ticket/typeDefs.ts
import { makeConnectionTypeDefs } from "@/graphql/pagination/typeDefs";
import { makeSortTypeDefs } from "@/graphql/sorting/sort-typeDefs";
import { DateTypeDefinition } from "graphql-scalars";
export const ticketTypeDefs = `#graphql
  ${DateTypeDefinition}

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
    deletedAt: Date
    sourceDepartmentForUser: Department!
    ticketDepartment: Department!

  }

  input TicketInput {
    title: String!
    description: String!
    categoryId: Int!
    assignedToId: Int
    department: Department
  }

  input TicketFilter {
    createdById: Int
    assignedToId: Int
    status: TicketStatus
    categoryId: Int
  }

  type Query {
    tickets(
      first: Int
      after: String
      orderBy: TicketOrderBy
      filter: TicketFilter
      scope: TicketScope = MINE
    ): TicketConnection!
  }

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

  type Mutation {
    createTicket(input: TicketInput!): Ticket!
    updateTicket(id: Int!, input: TicketInput!): Ticket!
    deleteTicket(id: Int!): Ticket!
  }
`;