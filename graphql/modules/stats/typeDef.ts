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
    average: Float!
  }

  type Query {
    ticketStatsByDepartment: [TicketStatsByDepartment!]!
  }
`;
