import { graphql } from "@/graphql-generated";

export const GET_USERS_FOR_MANAGEMENT = graphql(`
  query UsersManagement($search: String, $userId: Int, $role: Role, $department: Department, $categoryId: Int) {
    usersForManagement(search: $search, userId: $userId, role: $role, department: $department, categoryId: $categoryId) {
      id
      firstName
      lastName
      role
      department
      specializations {
        id
        name
        department
      }
    }
  }
`);

export const GET_USERS_BY_DEP_FOR_LOGIN = graphql(`
  query UsersByDepForLogin($department: Department!) {
    usersByDepForLogin(department: $department) {
      id
      firstName
      lastName
      email
      role
    }
  }
`);