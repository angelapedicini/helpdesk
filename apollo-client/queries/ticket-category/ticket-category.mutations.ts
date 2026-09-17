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

export const UPDATE_TICKET_CATEGORY = graphql(`
  mutation UpdateTicketCategory($id: Int!, $input: UpdateTicketCategoryInput!) {
    updateTicketCategory(id: $id, input: $input) {
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

export const CREATE_TICKET_CATEGORY_ACCESS = graphql(`
  mutation CreateTicketCategoryAccess($input: CreateTicketCategoryAccessInput!) {
    createTicketCategoryAccess(input: $input) {
      id
      categoryId
      disabled
      requesterDepartment
      requesterMinRole
    }
  }
`);

export const DELETE_TICKET_CATEGORY_ACCESS = graphql(`
  mutation DeleteTicketCategoryAccess($id: Int!) {
    deleteTicketCategoryAccess(id: $id) {
      id
      categoryId
      disabled
      requesterDepartment
      requesterMinRole
    }
  }
`);

export const RESTORE_TICKET_CATEGORY_ACCESS = graphql(`
  mutation RestoreTicketCategoryAccess($id: Int!) {
    restoreTicketCategoryAccess(id: $id) {
      id
      categoryId
      disabled
      requesterDepartment
      requesterMinRole
    }
  }
`);