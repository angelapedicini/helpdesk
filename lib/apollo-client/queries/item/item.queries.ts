import { graphql } from "@/lib/gql";

export const GET_ITEMS = graphql(`
  query Items {
    items {
      id
      string
      optionalEasy
      numberDecimal
      data
      dataOptional
      enum
      user {
        id
        firstName
        lastName
      }
    }
  }
`);