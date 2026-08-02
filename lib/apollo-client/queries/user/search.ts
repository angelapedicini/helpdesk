import { graphql } from "@/lib/gql";

export const SEARCH_USERS = graphql(`
  query SearchUsers($search: String) {
    searchUsers(search: $search) {
      id
      firstName
      lastName
    }
  }
`);