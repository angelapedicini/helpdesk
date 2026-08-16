import { rootTypeDefs } from "./root";
// schema/index.ts
import { userTypeDefs } from "./modules/user/typeDefs";
import { userResolvers } from "./modules/user/resolvers";
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
import { categoryResolvers } from "./modules/ticket-category/resolver";
import { ticketResolvers } from "./modules/ticket/resolvers";
import { userSpecializationResolvers } from "./modules/user-specialization/resolver";
import { userSpecializationTypeDefs } from "./modules/user-specialization/typeDef";
import { ticketHistoryResolvers } from "./modules/ticket-history/resolver";
import { ticketHistoryTypeDefs } from "./modules/ticket-history/typeDef";


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
  ticketHistoryTypeDefs,
];

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...ticketResolvers.Query,
    ...categoryResolvers.Query,
    ...userSpecializationResolvers.Query,
    ...ticketHistoryResolvers.Query,
  },
  Mutation: {
    ...registerResolvers.Mutation,
    ...loginResolvers.Mutation,
    ...refreshResolvers.Mutation,
    ...logoutResolvers.Mutation, 
    ...ticketResolvers.Mutation
  },
};