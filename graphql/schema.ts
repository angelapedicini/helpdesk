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
import { ticketNotificationTypeDefs } from "./modules/ticket-notification/typeDefs";
import { ticketNotificationResolvers } from "./modules/ticket-notification";
import { userSpecializationResolvers } from "./modules/user-specialization";
import { ticketSpecificationTypeDefs } from "./modules/ticket-specification/typeDefs";
import { userResolvers } from "./modules/user";
import { categoryResolvers } from "./modules/ticket-category";
import { ticketHistoryTypeDefs } from "./modules/ticket-history/typeDefs";
import { ticketHistoryResolvers } from "./modules/ticket-history";
import { demoResolvers } from "./modules/demo/resolvers";
import { demoTypeDefs } from "./modules/demo/typeDefs";
import { statTypeDefs } from "./modules/stats/typeDef";
import { statResolvers } from "./modules/stats";
import { dashboardTypeDefs } from "./modules/dashboard/typeDefs";
import { dashboardResolvers } from "./modules/dashboard";


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
  ticketNotificationTypeDefs,
  ticketSpecificationTypeDefs,
  ticketHistoryTypeDefs,
  demoTypeDefs,
  statTypeDefs,
  dashboardTypeDefs,
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
    ...ticketNotificationResolvers.Query,
    ...ticketHistoryResolvers.Query,
    ...statResolvers.Query,
    ...dashboardResolvers.Query,
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
    ...ticketNotificationResolvers.Mutation,
    ...userResolvers.Mutation,
    ...demoResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...userResolvers.Mutation,

  },
Ticket: ticketResolvers.Ticket,
    TicketSpecific: ticketResolvers.TicketSpecific,
    User: userResolvers.User,
};