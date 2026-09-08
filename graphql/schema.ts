import { rootTypeDefs } from "./root";
// schema/index.ts
import { userTypeDefs } from "./modules/user/typeDefs";
import { registerTypeDefs } from "./modules/auth/register/typeDefs";
import { registerResolvers } from "./modules/auth/register/resolvers";
import { loginResolvers } from "./modules/auth/login/resolvers";
import { loginTypeDefs } from "./modules/auth/login/typeDefs";
import { refreshTypeDefs } from "./modules/auth/refresh/typeDefs";
import { refreshResolvers } from "./modules/auth/refresh/resolvers";
import { logoutTypeDefs } from "./modules/auth/logout/typeDefs";
import { logoutResolvers } from "./modules/auth/logout/resolvers";
import { ticketTypeDefs } from "./modules/ticket/typeDefs";
// import { ticketResolvers } from "./modules/ticket/resolvers";
import { ticketCategoryTypeDefs } from "./modules/ticket-category/typeDefs";
import { ticketResolvers } from "./modules/ticket/resolvers";
import { userSpecializationTypeDefs } from "./modules/user-specialization/typeDef";
import { ticketMessageTypeDefs } from "./modules/ticket-messages/typeDefs";
import { ticketMessageResolvers } from "./modules/ticket-messages";
import { ticketReadStateTypeDefs } from "./modules/ticket-readState/typeDefs";
import { ticketReadStateResolvers } from "./modules/ticket-readState";
import { ticketAdminNotificationSubTypeDefs } from "./modules/ticket-adminNotificationSub/typeDefs";
import { ticketAdminNotificationResolvers } from "./modules/ticket-adminNotificationSub";
import { userSpecializationResolvers } from "./modules/user-specialization";
import { ticketSpecificationTypeDefs } from "./modules/ticket-specification/typeDefs";
import { userResolvers } from "./modules/user";
import { categoryResolvers } from "./modules/ticket-category";
import { ticketHistoryTypeDefs } from "./modules/ticket-history/typeDefs";
import { ticketHistoryResolvers } from "./modules/ticket-history";


export const typeDefs = [
  rootTypeDefs,
  userTypeDefs,
  registerTypeDefs,
  loginTypeDefs,
  refreshTypeDefs,
  logoutTypeDefs,
  ticketTypeDefs,
  ticketCategoryTypeDefs,
  userSpecializationTypeDefs,
  ticketMessageTypeDefs,
  ticketReadStateTypeDefs,
  ticketAdminNotificationSubTypeDefs,
  ticketSpecificationTypeDefs,
  ticketHistoryTypeDefs
];

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...ticketResolvers.Query,
    ...categoryResolvers.Query,
    ...userSpecializationResolvers.Query,
    ...ticketMessageResolvers.Query,
    ...ticketReadStateResolvers.Query,
    ...ticketAdminNotificationResolvers.Query,
    ...ticketHistoryResolvers.Query
  },
  Mutation: {
    ...registerResolvers.Mutation,
    ...loginResolvers.Mutation,
    ...refreshResolvers.Mutation,
    ...logoutResolvers.Mutation,
    ...ticketResolvers.Mutation,
    ...userSpecializationResolvers.Mutation,
    ...ticketMessageResolvers.Mutation,
    ...ticketReadStateResolvers.Mutation,
    ...ticketAdminNotificationResolvers.Mutation,
  },
  Ticket: ticketResolvers.Ticket,
  TicketSpecific: ticketResolvers.TicketSpecific,
};