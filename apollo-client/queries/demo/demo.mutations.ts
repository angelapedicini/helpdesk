import { graphql } from "@/graphql-generated";

export const START_DEMO_MUTATION = graphql(`
  mutation StartDemo {
    startDemo {
      success
      demoSessionId
    }
  }
`);