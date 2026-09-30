export const userTypeDefs = `#graphql
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    email: String!
    role: Role!
    department: Department!
    specializations: [TicketCategory!]!
  }

  enum Role {
    ADMIN
    TECHNICIAN
    EMPLOYEE
    SYSTEM_ADMIN
  }

  type UserSpecialization {
    id: Int!
    user: User!
    categoryId: Int
  }

  type UserPermission {
    id: Int!
    action: String!
    granted: Boolean!
    user: User!
  }

  type UserBasicInfo {
    id: Int!
    firstName: String!
    lastName: String!
  }

    type UserLoginInfo {
    id: Int!
    firstName: String!
    lastName: String!
    email: String!
    role: Role!
  }

  extend type Query {
    me: User
    searchUsers(search: String, role: Role, department: Department, categoryId: Int, restrictToDepartment: Boolean): [User!]!
    usersForManagement(search: String, userId: Int, role: Role, department: Department, categoryId: Int): [User!]!
    usersByDepForLogin(department: Department!): [UserLoginInfo!]!
  }

  input UpdateUserRoleInput {
    userId: Int!
    role: Role!
  }

  extend type Mutation {
    updateUserRole(input: UpdateUserRoleInput!): User!
  }
`;