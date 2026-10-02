// graphql/modules/user/resolvers/mutations.ts
import type { GraphQLContext } from "@/graphql/context";
import { GraphQLError } from "graphql/error";
import { defineAbility } from "@/lib/casl/defineAbility";
import { assertCanUpdateUserRole } from "@/lib/casl/abilities/user/guards";
import { assertAllowedRoleTransition } from "@/lib/user/roleTransitions";
import { UpdateUserRoleSchema } from "@/lib/validators/user.schema";
import { parseOrThrow } from "@/graphql/validate";

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  department: true,
} as const;

export const userMutations = {
  updateUserRole: async (
    _parent: unknown,
    args: { input: unknown },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const ability = defineAbility(session);
    const prisma = context.prisma;

    const input = parseOrThrow(UpdateUserRoleSchema, args.input);

    const target = await prisma.user.findUnique({
      where: { id: input.userId },
      select: USER_SELECT,
    });
    if (!target) {
      throw new GraphQLError("User not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    assertCanUpdateUserRole(ability, { id: target.id, role: target.role });
    assertAllowedRoleTransition(target.role, input.role);

    return prisma.user.update({
      where: { id: target.id },
      data: { role: input.role },
      select: USER_SELECT,
    });
  },
};