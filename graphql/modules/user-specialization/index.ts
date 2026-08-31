import { userSpecMutations } from "./resolvers/mutations";
import { userSpecQueries } from "./resolvers/queries";


export const userSpecializationResolvers = {
    Query: userSpecQueries,
    Mutation: userSpecMutations,
};