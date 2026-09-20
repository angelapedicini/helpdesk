import { graphql } from "@/graphql-generated";

export const CREATE_TICKET_CATEGORY = graphql(`
  mutation CreateTicketCategory($input: CreateTicketCategoryInput!) {
    createTicketCategory(input: $input) {
      id
      name
      department
      specificField
      disabled
    }
  }
`);

export const UPDATE_CATEGORY = graphql(`
  mutation UpdateCategory($id: Int!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      department
      specificField
      disabled
    }
  }
`);

export const DELETE_TICKET_CATEGORY = graphql(`
  mutation DeleteTicketCategory($id: Int!) {
    deleteTicketCategory(id: $id) {
      id
      name
      department
      specificField
      disabled
    }
  }
`);

export const RESTORE_TICKET_CATEGORY = graphql(`
  mutation RestoreTicketCategory($id: Int!) {
    restoreTicketCategory(id: $id) {
      id
      name
      department
      specificField
      disabled
    }
  }
`);