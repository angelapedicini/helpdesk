// modules/stats/typeDefs.ts
import { DateTypeDefinition } from "graphql-scalars";

export const statTypeDefs = `#graphql
  ${DateTypeDefinition}

  type TicketDepartmentStat {
    department: Department!

    totalTickets: Int!
    openCount: Int!
    pendingReviewCount: Int!
    inProgressCount: Int!
    closedCount: Int!
    refusedCount: Int!
    overdueCount: Int!

    sumResolutionHours: Float!
    closedWithResolutionCount: Int!
  }

  type TechnicianWorkloadStat {
    technicianId: Int!
    firstName: String!
    lastName: String!
    role: Role!
    department: Department!

    pendingReviewCount: Int!
    activeCount: Int!
    overdueCount: Int!
    closedThisPeriod: Int!

    sumResolutionHours: Float!
    closedWithResolutionCount: Int!
  }

  input DateRangeInput {
    from: Date
    to: Date
  }

  type Query {
    ticketStatsByDepartment(dateRange: DateRangeInput): [TicketDepartmentStat!]!
    technicianWorkloads(department: Department, dateRange: DateRangeInput): [TechnicianWorkloadStat!]!
  }
`;