import { ticketAdminNotificationMutations } from "./resolvers/mutations";
import { ticketAdminNotificationQueries } from "./resolvers/queries";


export const ticketAdminNotificationResolvers = {
    Query: ticketAdminNotificationQueries,
    Mutation: ticketAdminNotificationMutations,
};