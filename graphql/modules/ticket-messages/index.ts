// modules/ticket/resolvers/index.ts

import { ticketMessageMutations } from "./resolvers/mutations";
import { ticketMessageQueries } from "./resolvers/queries";


export const ticketMessageResolvers = {
  Query: ticketMessageQueries,
  Mutation: ticketMessageMutations,
};