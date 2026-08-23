export const userSpecializationTypeDefs = `#graphql
  type UserSpecializationTot {
    id: Int!
    user: User!
    category: TicketCategory!
  }

  input UserSpecInput {
    userId: Int!
    categoryId: Int!
  }

  extend type Query {
    soleSpecialistCategoryIds(department: Department!, userId: Int): [Int!]!
  }

  extend type Mutation {
    addUserSpecialization(input: UserSpecInput!): UserSpecializationTot!
    removeUserSpecialization(input: UserSpecInput!): Boolean!
  }
`;