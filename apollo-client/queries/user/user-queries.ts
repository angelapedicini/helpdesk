import { graphql } from "@/apollo-client/gql";

// @/apollo-client/queries/user-specialization/user-specialization.queries.ts (o dove preferisci)
export const GET_USERS_BY_DEPARTMENT = graphql(`
 query UsersByDepartment($userId: Int, $role: Role, $categoryId: Int) {
    usersByDepartment(userId: $userId, role: $role, categoryId: $categoryId) {
      id
      firstName
      lastName
      role
      specializations {
        id
        name
        department
      }
    }
  }
`);