import { ApolloServer } from "@apollo/server";
import { typeDefs, resolvers } from "./schema";
import type { GraphQLContext } from "./context";

export const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});
