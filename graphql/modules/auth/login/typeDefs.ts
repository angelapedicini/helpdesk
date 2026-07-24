export const loginTypeDefs = `#graphql
  input LoginInput {
    email: String!
    password: String!
  }

  type LoginPayload {
    # success: Boolean!
    user: User!
  }

  extend type Mutation {
    login(input: LoginInput!): LoginPayload!
  }
`;