import { graphql } from "@/graphql-generated";

export const SEARCH_USERS = graphql(`
  query SearchUsers($search: String, $role: Role, $department: Department, $categoryId: Int) {
    searchUsers(search: $search, role: $role, department: $department, categoryId: $categoryId) {
      id
      firstName
      lastName
    }
  }
`);