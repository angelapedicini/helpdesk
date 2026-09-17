import { getPrisma } from "@/lib/prisma/index";

import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { defineAbilityForUserManagement } from "@/lib/casl/abilities/user/rules";
import { assertCanManageSpecialization } from "@/lib/casl/abilities/user/guards";

type PrismaClient = Awaited<ReturnType<typeof getPrisma>>;

async function assertTargetCanBeManaged(prisma: PrismaClient, userId: number) {
  const session = await requireSession();
  const ability = defineAbilityForUserManagement(session);

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!target) {
    throw new GraphQLError("User not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  assertCanManageSpecialization(ability, { id: target.id, role: target.role });
}

export const userSpecMutations = {
  removeUserSpecialization: async (
    _parent: unknown,
    args: { input: { userId: number; categoryId: number } }
  ) => {
    const prisma = await getPrisma();

    const { userId, categoryId } = args.input;

    await assertTargetCanBeManaged(prisma, userId);

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
    const prisma = await getPrisma();

    const { userId, categoryId } = args.input;

    await assertTargetCanBeManaged(prisma, userId);

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
