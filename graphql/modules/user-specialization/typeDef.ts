export const userSpecializationTypeDefs = `#graphql
  type UserSpecialization {
    id: Int!
    userId: Int!
    categoryId: Int!
  }

  extend type Query {
    soleSpecialistCategoryIds(department: Department!, userId: Int): [Int!]!
  }
`;