// modules/ticket-stats/queries.ts
import { graphql } from "@/apollo-client/gql";

export const TICKET_STATS_BY_DEPARTMENT_QUERY = graphql(`
  query TicketStatsByDepartment($dateRange: DateRangeInput) {
    ticketStatsByDepartment(dateRange: $dateRange) {
      department
      totalTickets
      openCount
      pendingReviewCount
      inProgressCount
      closedCount
      refusedCount
      overdueCount
      sumResolutionHours
      closedWithResolutionCount
    }
  }
`);

export const TECHNICIAN_WORKLOADS_QUERY = graphql(`
  query TechnicianWorkloads($department: Department, $dateRange: DateRangeInput) {
    technicianWorkloads(department: $department, dateRange: $dateRange) {
      technicianId
      firstName
      lastName
      role
      department
      pendingReviewCount
      activeCount
      overdueCount
      closedThisPeriod
      sumResolutionHours
      closedWithResolutionCount
    }
  }
`);