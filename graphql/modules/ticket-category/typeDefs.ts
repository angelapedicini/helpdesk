export const ticketCategoryTypeDefs = `#graphql
  type TicketCategory {
    id: Int!
    name: String!
    department: Department!
  }

  extend type Query {
    categories(department: Department): [TicketCategory!]!
    categoryById(id: Int!): TicketCategory
  }
`

