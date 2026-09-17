// lib/apollo-client/queries/auth/logout/logout.mutation.ts

import { graphql } from "@/graphql-generated";

export const LOGOUT = graphql(`
  mutation Logout {
    logout {
      success
    }
  }
`);