import { graphql } from "@/lib/gql";

export const CREATE_ITEM = graphql(`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      id
      string
      optionalEasy
      numberDecimal
      data
      dataOptional
      enum
      user {
        id
        firstName
        lastName
      }
    }
  }
`);

export const UPDATE_ITEM = graphql(`
  mutation UpdateItem($id: Int!, $input: UpdateItemInput!) {
    updateItem(id: $id, input: $input) {
      id
      string
      optionalEasy
      numberDecimal
      data
      dataOptional
      enum
      user {
        id
        firstName
        lastName
      }
    }
  }
`);

export const DELETE_ITEM = graphql(`
  mutation DeleteItem($id: Int!) {
    deleteItem(id: $id) {
      id
    }
  }
`);