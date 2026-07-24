import { DateTypeDefinition } from "graphql-scalars";

export const itemTypeDefs = `#graphql
  ${DateTypeDefinition}

  enum ItemStatus {
    ACCETTATO
    RIFIUTATO
    ATTESA
  }

  type Item {
    id: Int!
    string: String!
    optionalEasy: String
    numberDecimal: Float!
    data: Date!
    dataOptional: String
    enum: ItemStatus!
    user: User!
  }

  input CreateItemInput {
    string: String!
    optionalEasy: String
    numberDecimal: Float!
    data: Date!
    dataOptional: String
    enum: ItemStatus!
    userId: Int!
  }

  input UpdateItemInput {
    string: String
    optionalEasy: String
    numberDecimal: Float
    data: Date
    dataOptional: String
    enum: ItemStatus
    userId: Int
  }

  extend type Query {
    items: [Item!]!
  }

  extend type Mutation {
    createItem(input: CreateItemInput!): Item!
    updateItem(id: Int!, input: UpdateItemInput!): Item!
    deleteItem(id: Int!): Item!
  }
`;