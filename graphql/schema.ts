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


export const typeDefs = [
  rootTypeDefs,
  userTypeDefs,
  registerTypeDefs,
  loginTypeDefs,
  refreshTypeDefs,
  logoutTypeDefs, 
];

export const resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...registerResolvers.Mutation,
    ...loginResolvers.Mutation,
    ...refreshResolvers.Mutation,
    ...logoutResolvers.Mutation, 
  },
};