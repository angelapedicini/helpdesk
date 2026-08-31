export const rootTypeDefs = `#graphql
   type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

    type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  enum SortDirection {
    ASC
    DESC
  }

  enum Department {
    HR
    IT
    FINANCE
    SUPPORT
    LOGISTIC
  }


  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;