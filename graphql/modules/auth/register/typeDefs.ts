// modules/auth/register/typeDefs.ts
export const registerTypeDefs = `#graphql
  input CreateUserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    department: Department!
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
  }
`;