import { graphql } from "@/apollo-client/gql";

export const SEARCH_USERS = graphql(`
  query SearchUsers($search: String, $role: Role, $department: Department) {
    searchUsers(search: $search, role: $role, department: $department) {
      id
      firstName
      lastName
    }
  }
`);