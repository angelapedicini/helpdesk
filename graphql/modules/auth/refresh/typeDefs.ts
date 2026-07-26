// modules/auth/refresh/typeDefs.ts
export const refreshTypeDefs = `#graphql
  type RefreshPayload {
    success: Boolean!
  }

  extend type Mutation {
    refreshToken: RefreshPayload!
  }
`;