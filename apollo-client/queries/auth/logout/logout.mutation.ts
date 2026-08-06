// lib/apollo-client/queries/auth/logout/logout.mutation.ts

import { graphql } from "@/apollo-client/gql";

export const LOGOUT = graphql(`
  mutation Logout {
    logout {
      success
    }
  }
`);