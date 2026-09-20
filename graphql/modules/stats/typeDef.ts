// modules/stats/typeDefs.ts
import { DateTypeDefinition } from "graphql-scalars";

export const statTypeDefs = `#graphql
  ${DateTypeDefinition}

  type TicketStatsByDepartment {
    department: Department!
    total: Int!
    open: Int!
    assigned: Int!
    inProgress: Int!
    closed: Int!
    refused: Int!
    firstResponseLate: Int!
    dueDateLate: Int!
    closedOnTime: Int!
    openAssignedLate: Int!
    average: Float!
  }

  type TicketStatsByTechnician {
    technicianId: ID!
    label: String!
    total: Int!
    open: Int!
    assigned: Int!
    inProgress: Int!
    closed: Int!
    refused: Int!
    firstResponseLate: Int!
    dueDateLate: Int!
    average: Float!
  }

  extend type Query {
    ticketStatsByDepartment(department: Department): [TicketStatsByDepartment!]!
    ticketStatsByTechnician(department: Department): [TicketStatsByTechnician!]!
  }
`;
