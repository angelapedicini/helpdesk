export const demoTypeDefs = `#graphql
  type StartDemoResult {
    success: Boolean!
    demoSessionId: String!
  }

  extend type Mutation {
    startDemo: StartDemoResult!
  }
`;