import { graphql } from "@/graphql-generated";

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

