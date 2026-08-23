import { graphql } from "@/apollo-client/gql";
import type { ResultOf } from "@graphql-typed-document-node/core";

export const GET_MESSAGES = graphql(`
  query GetTicketMessages($ticketId: Int!, $first: Int, $after: String) {
    messages(ticketId: $ticketId, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          content
          createdAt
          author {
            id
            firstName
            lastName
            role
          }
          ticket {
            id
            status
            createdBy { id }
            assignedTo { id }
            category { id }
            ticketDepartment
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

export type MessageConnection = ResultOf<typeof GET_MESSAGES>["messages"];
export type TicketMessage = MessageConnection["edges"][number]["node"];