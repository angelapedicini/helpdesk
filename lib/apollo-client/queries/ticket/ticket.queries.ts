import { graphql } from "@/lib/gql";
import type { ResultOf } from "@graphql-typed-document-node/core";

export const GET_TICKETS = graphql(`
  query Tickets(
    $first: Int
    $after: String
    $orderBy: TicketOrderBy
    $filter: TicketFilter
  ) {
    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter) {
      edges {
        cursor
        node {
          id title description status
          category { id name department }
          createdBy { id firstName lastName }
          assignedTo { id firstName lastName }
          createdAt updatedAt closedAt
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`);

export type TicketConnection = ResultOf<typeof GET_TICKETS>["tickets"];
export type Ticket = TicketConnection["edges"][number]["node"];

// se il codegen non genera già l'enum come union type utilizzabile, definiscilo qui
// coerente 1:1 con l'enum TicketSortField dello schema
export type TicketSortField =
  | "ID"
  | "TITLE"
  | "DESCRIPTION"
  | "STATUS"
  | "CATEGORY"
  | "DEPARTMENT"
  | "CREATED_BY"
  | "ASSIGNED_TO"
  | "CREATED_AT"
  | "UPDATED_AT"
  | "CLOSED_AT";