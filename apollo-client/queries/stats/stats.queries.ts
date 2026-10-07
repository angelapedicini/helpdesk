// modules/stats/queries.ts
import { graphql } from "@/graphql-generated";

export const TICKET_STATS_BY_DEPARTMENT_QUERY = graphql(`
  query TicketStatsByDepartment {
    ticketStatsByDepartment {
      department
      total
      open
      assigned
      inProgress
      closed
      refused
      firstResponseLate
      dueDateLate
      closedOnTime
      openAssignedLate
      average
    }
  }
`);

export const TICKET_STATS_BY_TECHNICIAN_QUERY = graphql(`
  query TicketStatsByTechnician {
    ticketStatsByTechnician {
      technicianId
      label
      total
      open
      assigned
      inProgress
      closed
      refused
      firstResponseLate
      dueDateLate
      average
    }
  }
`);

export const TICKET_STATS_BY_CATEGORY_QUERY = graphql(`
  query TicketStatsByCategory {
    ticketStatsByCategory {
      categoryId
      name
      department
      total
      open
      assigned
      inProgress
      closed
      refused
      firstResponseLate
      dueDateLate
      closedOnTime
      openAssignedLate
      average
    }
  }
`);
