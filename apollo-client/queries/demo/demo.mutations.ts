import { graphql } from "@/apollo-client/gql";

export const START_DEMO_MUTATION = graphql(`
  mutation StartDemo {
    startDemo {
      success
      demoSessionId
    }
  }
`);