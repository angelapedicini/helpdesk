// modules/ticket/resolvers/index.ts
import { ticketQueries } from "./queries";
import { ticketMutations } from "./mutations"; // <- verifica il nome esatto del tuo file/export mutation
import { ticketFieldResolvers } from "./field";

export const ticketResolvers = {
  Query: ticketQueries,
  Mutation: ticketMutations,
  Ticket: ticketFieldResolvers.Ticket,
  TicketSpecific: ticketFieldResolvers.TicketSpecific,
};