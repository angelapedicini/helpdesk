// lib/apollo-client/queries/ticket/ticket.mutation.ts

import { graphql } from "@/apollo-client/gql";

export const CREATE_TICKET = graphql(`
  mutation CreateTicket($input: TicketInput!) {
    createTicket(input: $input) {
      ...TicketFields
    }
  }
`);

export const UPDATE_TICKET = graphql(`
  mutation UpdateTicket($id: Int!, $input: TicketUpdateInput!) {
    updateTicket(id: $id, input: $input) {
      ...TicketFields
    }
  }
`);

export const DELETE_TICKET = graphql(`
  mutation DeleteTicket($id: Int!) {
    deleteTicket(id: $id) {
      ...TicketFields
    }
  }
`);