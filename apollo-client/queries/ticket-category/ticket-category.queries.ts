import { graphql } from "@/apollo-client/gql";

export const GET_CATEGORIES = graphql(`
  query Categories($department: Department) {
    categories(department: $department) {
      id
      name
      department
    }
  }
`);

