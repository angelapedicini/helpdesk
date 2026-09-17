import { userQueries } from "./resolvers/queries";
import { userMutations } from "./resolvers/mutations";

export const userResolvers = {
    Query: userQueries,
    Mutation: userMutations,
    User: {
        specializations: (user: { specializations?: unknown }) =>
            user.specializations ?? [],
    },
};