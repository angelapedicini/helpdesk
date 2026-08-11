// modules/ticket/resolvers/index.ts
import { ticketMutations } from "./mutations";
import { ticketQueries } from "./queries";

export const ticketResolvers = {
  Query: ticketQueries,
  Mutation: ticketMutations,
};