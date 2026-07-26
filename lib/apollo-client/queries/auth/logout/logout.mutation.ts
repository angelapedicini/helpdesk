// lib/apollo-client/queries/auth/logout/logout.mutation.ts
import { graphql } from "@/lib/gql";

export const LOGOUT = graphql(`
  mutation Logout {
    logout {
      success
    }
  }
`);