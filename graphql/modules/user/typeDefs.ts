export const userTypeDefs = `#graphql
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    email: String!
    roleName: String!
    items: [Item!]!
  }

  extend type Query {
    users: [User!]!
  }
`;





