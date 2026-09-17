import { categoryQueries } from "./resolvers/queries";
import { categoryMutations } from "./resolvers/mutations";

export const categoryResolvers = {
    Query: categoryQueries,
    Mutation: categoryMutations,
};