import { getPrisma } from "@/lib/prisma/index";

import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type { GraphQLContext } from "@/graphql/context";
import { GraphQLError } from "graphql/error";
import { defineAbility } from "@/lib/casl/defineAbility";
import { assertCanManageSpecialization } from "@/lib/casl/abilities/user/guards";
import { parseOrThrow } from "@/graphql/validate";
import { CreateUserSpecSchema } from "@/lib/validators/userSpec.schema";

type PrismaClient = Awaited<ReturnType<typeof getPrisma>>;

async function assertTargetCanBeManaged(
  prisma: PrismaClient,
  session: AccessTokenPayload,
  userId: number
) {
  const ability = defineAbility(session);

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, department: true },
  });

  if (!target) {
    throw new GraphQLError("User not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // department è necessario: la regola manageSpecialization dell'admin
  // è condizionata al dipartimento del target.
  assertCanManageSpecialization(ability, {
    id: target.id,
    role: target.role,
    department: target.department,
  });
}

export const userSpecMutations = {
  removeUserSpecialization: async (
    _parent: unknown,
    args: { input: { userId: number; categoryId: number } },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const { userId, categoryId } = parseOrThrow(CreateUserSpecSchema, args.input);
    const prisma = await getPrisma();


    await assertTargetCanBeManaged(prisma, session, userId);

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
    args: { input: { userId: number; categoryId: number } },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
     const { userId, categoryId } = parseOrThrow(CreateUserSpecSchema, args.input);
    const prisma = await getPrisma();


    await assertTargetCanBeManaged(prisma, session, userId);

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
