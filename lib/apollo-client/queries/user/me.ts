import { graphql } from "@/lib/gql";


export const ME_QUERY = graphql(`
  query Me {
    me {
      id
      firstName
      lastName
      email
      roleName
    }
  }
`);