// lib/apollo-client/queries/ticket/ticket.mutations.ts

import { graphql } from "@/apollo-client/gql";

export const CREATE_TICKET = graphql(`
  mutation CreateTicket($input: TicketInput!) {
    createTicket(input: $input) {
      id
      title
      description
      status
      priority
      ticketDepartment
      category {
        id
        name
        department
      }
      createdBy {
        id
        firstName
        lastName
      }
      assignedTo {
        id
        firstName
        lastName
      }
      createdAt
      updatedAt
      closedAt
      dueDate
    }
  }
`);

export const UPDATE_TICKET = graphql(`
  mutation UpdateTicket($id: Int!, $input: TicketUpdateInput!) {
    updateTicket(id: $id, input: $input) {
      id
      title
      description
      status
      priority
      ticketDepartment
      category {
        id
        name
        department
      }
      createdBy {
        id
        firstName
        lastName
      }
      assignedTo {
        id
        firstName
        lastName
      }
      createdAt
      updatedAt
      closedAt
      dueDate
    }
  }
`);

export const DELETE_TICKET = graphql(`
  mutation DeleteTicket($id: Int!) {
    deleteTicket(id: $id) {
      id
      deletedAt
    }
  }
`);