import { graphql } from "@/apollo-client/gql";
import type { ResultOf } from "@graphql-typed-document-node/core";
import type { TicketFieldsFragment } from "@/apollo-client/gql/graphql";

export const GET_TICKETS = graphql(`
  query Tickets(
    $first: Int
    $after: String
    $orderBy: TicketOrderBy
    $filter: TicketFilter
    $scope: TicketScope
  ) {
    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter, scope: $scope) {
      edges {
        cursor
        node {
          ...TicketFields
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`);

export type TicketConnection = ResultOf<typeof GET_TICKETS>["tickets"];

// Tipo "grezzo" (mascherato), così com'è nella response Apollo
export type TicketNode = TicketConnection["edges"][number]["node"];

// Tipo "vero" coi campi risolti (id, title, status, ecc.)
// = il tipo del fragment generato direttamente da codegen
export type Ticket = TicketFieldsFragment;

export type TicketSortField =
  | "ID"
  | "TITLE"
  | "DESCRIPTION"
  | "STATUS"
  | "PRIORITY"
  | "CATEGORY"
  | "DEPARTMENT"
  | "CREATED_BY"
  | "ASSIGNED_TO"
  | "CREATED_AT"
  | "UPDATED_AT"
  | "CLOSED_AT";

export type TicketScope = "MINE" | "ASSIGNED_TO_ME" | "DEPARTMENT";

export const GET_TICKET_BY_ID = graphql(`
  query GetTicketById($id: Int!) {
    ticket(id: $id) {
      ...TicketFields
    }
  }
`);