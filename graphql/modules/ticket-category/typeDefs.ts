export const ticketCategoryTypeDefs = `#graphql
  type TicketCategory {
    id: Int!
    name: String!
    department: Department!
    specificField: TicketSpecificField
    disabled: Boolean
  }

  type TicketCategoryAccess {
    id: Int!
    categoryId: Int!
    disabled: Boolean
    requesterDepartment: Department
    requesterMinRole: Role!
  }

  input CreateTicketCategoryInput {
    name: String!
    department: Department!
    specificField: TicketSpecificField
  }

  input UpdateTicketCategoryInput {
    name: String
    specificField: TicketSpecificField
  }

  input CreateTicketCategoryAccessInput {
    categoryId: Int!
    requesterDepartment: Department
    requesterMinRole: Role!
  }

  input UpdateCategoryAccessGrantInput {
    requesterDepartment: Department
    requesterMinRole: Role!
  }

  input UpdateCategoryInput {
    name: String
    specificField: TicketSpecificField
    accessGrants: [UpdateCategoryAccessGrantInput!]
  }

  extend type Query {
    categories(department: Department, includeDisabled: Boolean): [TicketCategory!]!
    categoryById(id: Int!): TicketCategory
    categoryAccesses(categoryId: Int): [TicketCategoryAccess!]!
  }

  extend type Mutation {
    createTicketCategory(input: CreateTicketCategoryInput!): TicketCategory!
    updateTicketCategory(id: Int!, input: UpdateTicketCategoryInput!): TicketCategory!
    updateCategory(id: Int!, input: UpdateCategoryInput!): TicketCategory!
    deleteTicketCategory(id: Int!): TicketCategory!
    restoreTicketCategory(id: Int!): TicketCategory!
    createTicketCategoryAccess(input: CreateTicketCategoryAccessInput!): TicketCategoryAccess!
    deleteTicketCategoryAccess(id: Int!): TicketCategoryAccess!
    restoreTicketCategoryAccess(id: Int!): TicketCategoryAccess!
  }
`