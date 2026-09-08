import { graphql } from "@/apollo-client/gql";


export const GET_TICKET_HISTORY_BY_TICKET_ID = graphql(`
  query TicketHistoryByTicketId(
    $ticketId: Int!
    $first: Int
    $after: String
    $filter: TicketHistoryFilter
  ) {
    ticketHistoryByTicketId(
      ticketId: $ticketId
      first: $first
      after: $after
      filter: $filter
    ) {
      edges {
        cursor
        node {
          id
          originalTicketId
          title
          description
          status
          priority
          category {
            id
            name
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
          lastUpdatedBy {
            id
            firstName
            lastName
          }
          closingMessage
          ticketSpecific
          deletedAt
          deletedBy {
            id
            firstName
            lastName
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

export const GET_DELETED_TICKETS = graphql(`
  query DeletedTickets(
    $first: Int
    $after: String
    $filter: TicketHistoryFilter
    $scope: TicketScope
  ) {
    deletedTickets(
      first: $first
      after: $after
      filter: $filter
      scope: $scope
    ) {
      edges {
        cursor
        node {
          id
          originalTicketId
          title
          description
          status
          priority
          category {
            id
            name
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
          lastUpdatedBy {
            id
            firstName
            lastName
          }
          closingMessage
          ticketSpecific
          deletedAt
          deletedBy {
            id
            firstName
            lastName
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