export const userTypeDefs = `#graphql
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    email: String!
    role: Role!
    department: Department!
  }

  enum Role {
    ADMIN
    TECHNICIAN
    EMPLOYEE
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

  extend type Query {
    me: User
    searchUsers(search: String, role: Role, department: Department): [User!]!
  }
`;