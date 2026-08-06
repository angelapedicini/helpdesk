// lib/apollo-client/features/auth/auth.mutations.ts

import { graphql } from "@/apollo-client/gql";

export const LOGIN = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`);