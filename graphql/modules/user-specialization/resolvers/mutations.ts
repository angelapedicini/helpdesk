import { getPrisma } from "@/lib/prisma/index";

import { requireAdmin } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";

export const userSpecMutations = {
  removeUserSpecialization: async (
    _parent: unknown,
    args: { input: { userId: number; categoryId: number } }
  ) => {
    const session = await requireAdmin();
    if (!session) {
      throw new GraphQLError("Unauthorized", {
        extensions: { code: "FORBIDDEN" },
      });
    }
    const prisma = await getPrisma();

    const { userId, categoryId } = args.input;

    try {
      await prisma.userSpecialization.delete({
        where: {
          userId_categoryId: { userId, categoryId },
        },
      });

      return true;
    } catch (err) {
      throw new GraphQLError("Specialization not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }
  },

  addUserSpecialization: async (
    _parent: unknown,
    args: { input: { userId: number; categoryId: number } }
  ) => {
    const session = await requireAdmin();
    if (!session) {
      throw new GraphQLError("Unauthorized", {
        extensions: { code: "FORBIDDEN" },
      });
    }
    const prisma = await getPrisma();


    const { userId, categoryId } = args.input;

    try {
      const specialization = await prisma.userSpecialization.create({
        data: {
          userId,
          categoryId,
        },
        include: {
          user: true,
          category: true,
        },
      });

      return specialization;
    } catch (err: any) {
      if (err.code === "P2002") {
        throw new GraphQLError("Specializzazione già presente per questo utente", {
          extensions: { code: "CONFLICT" },
        });
      }
      throw new GraphQLError("Impossibile aggiungere la specializzazione", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  },

}