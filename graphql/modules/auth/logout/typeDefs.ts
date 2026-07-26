// modules/auth/logout/typeDefs.ts
export const logoutTypeDefs = `#graphql
  type LogoutPayload {
    success: Boolean!
  }

  extend type Mutation {
    logout: LogoutPayload!
  }
`;