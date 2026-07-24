import { rootTypeDefs } from "./root";
import { itemTypeDefs } from "./modules/item/typeDefs";
import { itemResolvers } from "./modules/item/resolvers";
import { userTypeDefs } from "./modules/user/typeDefs";
import { userResolvers } from "./modules/user/resolvers";
import { registerTypeDefs } from "./modules/auth/register/typeDefs";
import { registerResolvers } from "./modules/auth/register/resolvers";
import { loginResolvers } from "./modules/auth/login/resolvers";
import { loginTypeDefs } from "./modules/auth/login/typeDefs";

export const typeDefs = [rootTypeDefs, itemTypeDefs, userTypeDefs, registerTypeDefs, loginTypeDefs]; // <-- mancava authTypeDefs

export const resolvers = {
  Query: {
    ...itemResolvers.Query,
    ...userResolvers.Query,
  },
  Mutation: {
    ...itemResolvers.Mutation,
    ...registerResolvers.Mutation,
    ...loginResolvers.Mutation,
  },
};