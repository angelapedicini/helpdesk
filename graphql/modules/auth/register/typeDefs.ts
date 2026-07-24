export const registerTypeDefs = `#graphql
  input CreateUserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
  }
`;