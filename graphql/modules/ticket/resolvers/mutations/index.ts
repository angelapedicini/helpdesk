// modules/ticket/resolvers/mutations/index.ts
import { createTicket } from "./create";
import { updateTicket } from "./update";

export const ticketMutations = {
  createTicket,
  updateTicket,
};