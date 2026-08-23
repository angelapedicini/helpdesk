// @/apollo-client/queries/user-specialization/user-specialization.queries.ts
import { graphql } from "@/apollo-client/gql";

export const SOLE_SPECIALIST_CATEGORY_IDS = graphql(`
  query SoleSpecialistCategoryIds($department: Department!, $userId: Int) {
    soleSpecialistCategoryIds(department: $department, userId: $userId)
  }

  
`);


