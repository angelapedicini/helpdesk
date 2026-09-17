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
          ...TicketHistoryFields
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
          ...TicketHistoryFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);