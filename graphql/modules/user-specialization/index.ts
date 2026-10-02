import { userSpecializationMutations } from "./resolvers/mutations";
import { userSpecializationQueries } from "./resolvers/queries";

export const userSpecializationResolvers = {
    Query: userSpecializationQueries,
    Mutation: userSpecializationMutations,
};
