import { graphql } from "@/apollo-client/gql";
import type { ResultOf } from "@graphql-typed-document-node/core";

export const TICKET_SNAPSHOT_FIELDS = graphql(`
  fragment TicketSnapshotFields on TicketSnapshot {
    id
    title
    description
    status
    priority
    category {
      id
      name
      department
    }
    createdBy {
      id
      firstName
      lastName
    }
    assignedTo {
      id
      firstName
      lastName
    }
    createdAt
    updatedAt
    closedAt
    dueDate
    deletedAt
    sourceDepartmentForUser
    ticketDepartment
    lastUpdatedBy {
      id
      firstName
      lastName
    }
    closingMessage
    specificValue
  }
`);

export const GET_TICKET_HISTORY = graphql(`
  query GetTicketHistory($ticketId: Int!, $first: Int, $after: String) {
    ticketHistory(ticketId: $ticketId, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          ticketId
          createdAt

          snapshotBefore {
            ...TicketSnapshotFields
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export type TicketHistoryConnection = ResultOf<typeof GET_TICKET_HISTORY>["ticketHistory"];
export type TicketHistoryEdge = TicketHistoryConnection["edges"][number];
export type TicketHistoryNode = TicketHistoryEdge["node"];