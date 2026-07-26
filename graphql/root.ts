export const rootTypeDefs = `#graphql
  enum Department {
    HR
    IT
    FINANCE
    SALES
    MARKETING
  }

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;