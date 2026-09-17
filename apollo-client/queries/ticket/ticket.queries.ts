import { graphql } from "@/apollo-client/gql";
import type { ResultOf } from "@graphql-typed-document-node/core";
// import type { TicketFieldsFragment } from "@/apollo-client/gql/graphql";
import type { TicketFieldsFragment, TicketSortField } from "@/apollo-client/gql/graphql";

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

export const ticketSortFieldMap: Partial<
    Record<keyof TicketFieldsFragment, TicketSortField>
> = {
    id: "ID",
    title: "TITLE",
    description: "DESCRIPTION",
    status: "STATUS",
    priority: "PRIORITY",
    category: "CATEGORY",
    ticketDepartment: "DEPARTMENT",
    createdBy: "CREATED_BY",
    assignedTo: "ASSIGNED_TO",
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
    closedAt: "CLOSED_AT",
    dueFirstResponse: "DUE_FIRST_RESPONSE",
    dueDate: "DUE_DATE",
};

export type TicketScope = "MINE" | "ASSIGNED_TO_ME" | "DEPARTMENT"| "ALL";

export const GET_TICKET_BY_ID = graphql(`
  query GetTicketById($id: Int!) {
    ticket(id: $id) {
      ...TicketFields
    }
  }
`);