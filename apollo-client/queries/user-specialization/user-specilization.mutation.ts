// @/apollo-client/queries/user-specialization/user-specialization.mutation.ts
import { graphql } from "@/apollo-client/gql";

export const ADD_USER_SPECIALIZATION = graphql(`
  mutation AddUserSpecialization($input: UserSpecInput!) {
    addUserSpecialization(input: $input) {
      id
      user {
        id
        firstName
        lastName
      }
      category {
        id
        name
      }
    }
  }
`);

export const REMOVE_USER_SPECIALIZATION = graphql(`
  mutation RemoveUserSpecialization($input: UserSpecInput!) {
    removeUserSpecialization(input: $input)
  }
`);