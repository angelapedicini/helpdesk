// modules/ticket/typeDefs.ts
import { makeConnectionTypeDefs } from "@/graphql/pagination/typeDefs";
import { makeSortTypeDefs } from "@/graphql/sorting/sort-typeDefs";
import { DateTypeDefinition } from "graphql-scalars";
import { TICKET_SORT_FIELD_MAP } from "./resolvers/where";
export const ticketTypeDefs = `#graphql
  ${DateTypeDefinition}

  
  ${makeConnectionTypeDefs("Ticket")}
  ${makeSortTypeDefs("Ticket", Object.keys(TICKET_SORT_FIELD_MAP))}

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
    dueFirstResponse: Date  
    reopenCount: Int!       
    reopenReason: String 
    sourceDepartmentForUser: Department!
    ticketDepartment: Department!
    lastUpdatedBy: User
    closingMessage: String
    specificData: TicketSpecific
  }

  input TicketInput {
    title: String!
    description: String!
    categoryId: Int
    priority: TicketPriority!
    department: Department!
    specificValue: String
  }

input TicketFilter {
    createdById: Int
    assignedToId: Int
    status: TicketStatus
    categoryId: Int
    priority: TicketPriority

    firstResponseOverdue: Boolean  
    reopened: Boolean              

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
    specificValue: String
    reopenReason: String
}


  type Mutation {
    createTicket(input: TicketInput!): Ticket!
    updateTicket(id: Int!, input: TicketUpdateInput!): Ticket!
    deleteTicket(id: Int!): Ticket!
  }
`;