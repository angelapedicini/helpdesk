import { ticketReadStateQueries } from "./resolvers/queries";
import { ticketReadStateMutations } from "./resolvers/mutations";

export const ticketReadStateResolvers = {
    Query: ticketReadStateQueries,
    Mutation: ticketReadStateMutations,
};