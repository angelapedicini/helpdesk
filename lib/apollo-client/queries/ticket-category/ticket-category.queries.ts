import { graphql } from "@/lib/gql";

export const GET_CATEGORIES = graphql(`
  query Categories {
    categories {
      id
      name
      department
    }
  }
`);

