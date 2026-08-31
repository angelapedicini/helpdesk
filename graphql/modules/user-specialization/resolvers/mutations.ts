import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";

export const userSpecMutations = {
     removeUserSpecialization: async (
        _parent: unknown,
        args: { input: { userId: number; categoryId: number } }
      ) => {
        const session = await requireAdmin();
        if (!session) {
          throw new GraphQLError("Non autorizzato", {
            extensions: { code: "FORBIDDEN" },
          });
        }

        const { userId, categoryId } = args.input;

        try {
          await prisma.userSpecialization.delete({
            where: {
              userId_categoryId: { userId, categoryId },
            },
          });

          return true;
        } catch (err) {
          throw new GraphQLError("Specializzazione non trovata", {
            extensions: { code: "NOT_FOUND" },
          });
        }
      },

}