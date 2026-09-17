import { graphql } from "@/graphql-generated";

export const REGISTER = graphql(`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
    }
  }
`);