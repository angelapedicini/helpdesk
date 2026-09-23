import { ticketNotificationMutations } from "./resolvers/mutations";
import { ticketNotificationQueries } from "./resolvers/queries";

export const ticketNotificationResolvers = {
  Query: ticketNotificationQueries,
  Mutation: ticketNotificationMutations,
};