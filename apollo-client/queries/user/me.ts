import { graphql } from "@/apollo-client/gql";

export const ME_QUERY = graphql(`
  query Me {
    me {
      id
      firstName
      lastName
      email
      role
      department
    }
  }
`);

