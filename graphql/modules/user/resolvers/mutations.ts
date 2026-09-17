// graphql/modules/user/resolvers/mutations.ts
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { defineAbility } from "@/lib/casl/defineAbility";
import { assertCanUpdateUserRole } from "@/lib/casl/abilities/user/guards";
import { assertAllowedRoleTransition } from "@/lib/user/roleTransitions";
import { UpdateUserRoleSchema } from "@/lib/validators/user.schema";
import { getPrisma } from "@/lib/prisma/index";

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  department: true,
} as const;

export const userMutations = {
  updateUserRole: async (_parent: unknown, args: { input: unknown }) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    const prisma = await getPrisma();

    const result = UpdateUserRoleSchema.safeParse(args.input);
    if (!result.success) {
      throw new GraphQLError("Invalid input", {
        extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
      });
    }
    const input = result.data;

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