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

  extend type Query {
    me: User
  }
`;