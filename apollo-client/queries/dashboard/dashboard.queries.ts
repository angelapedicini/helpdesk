// apollo-client/queries/dashboard/dashboard.queries.ts
import { graphql } from "@/graphql-generated";

export const GET_DASHBOARD = graphql(`
  query GetDashboard {
    dashboard {
      counterGroups {
        scope
        alerts {
          firstResponseOverdue
          dueDateOverdue
          reopened
          firstResponseDueSoon
          dueDateDueSoon
        }
      }
      ticketLists {
        list
        tickets {
          id
          title
          status
          createdAt
          dueDate
        }
      }
      notifications {
        id
        type
        updatedAt
        ticketId
        actor
      }
    }
  }
`);
