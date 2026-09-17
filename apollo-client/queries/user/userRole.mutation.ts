import { graphql } from "@/graphql-generated";

export const UPDATE_USER_ROLE = graphql(`
  mutation UpdateUserRole($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
      id
      firstName
      lastName
      email
      role
      department
    }
  }
`);