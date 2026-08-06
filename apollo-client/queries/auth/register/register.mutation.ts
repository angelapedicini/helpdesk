import { graphql } from "@/apollo-client/gql";

export const REGISTER = graphql(`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
    }
  }
`);