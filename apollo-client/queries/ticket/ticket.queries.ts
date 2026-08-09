import { graphql } from "@/apollo-client/gql";
import type { ResultOf } from "@graphql-typed-document-node/core";

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
          id 
          title 
          description 
          status 
          priority
          category { id name department }
          createdBy { id firstName lastName }
          assignedTo { id firstName lastName }
          createdAt 
          updatedAt 
          dueDate
          closedAt
          ticketDepartment
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`);

export type TicketConnection = ResultOf<typeof GET_TICKETS>["tickets"];
export type Ticket = TicketConnection["edges"][number]["node"];

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

// coerente 1:1 con l'enum TicketScope dello schema GraphQL
export type TicketScope = "MINE" | "ASSIGNED_TO_ME" | "DEPARTMENT";

export const GET_TICKET_BY_ID = graphql(`
  query Ticket($id: Int!) {
    ticket(id: $id) {
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
      sourceDepartmentForUser
      ticketDepartment
    }
  }
`);

export type TicketDetail = NonNullable<ResultOf<typeof GET_TICKET_BY_ID>["ticket"]>;

