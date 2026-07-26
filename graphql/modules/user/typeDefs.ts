export const userTypeDefs = `#graphql
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    email: String!
    roleName: String!
  }

  extend type Query {
    me: User
  }
`;