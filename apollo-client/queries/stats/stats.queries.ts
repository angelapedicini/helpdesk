// modules/stats/queries.ts
import { graphql } from "@/apollo-client/gql";

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
      average
    }
  }
`);
