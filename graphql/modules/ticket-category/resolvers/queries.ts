import { getPrisma } from "@/lib/prisma/index";
import { getSession, requireSession } from "@/lib/auth/session";
import { Department } from "@/app/generated/prisma/enums";
import { getAllowedCategories, assertCanManageTicketCategory, assertCanManageTicketCategoryAccess } from "@/lib/casl/abilities/category/guards";
import { defineAbility } from "@/lib/casl/defineAbility";

export const categoryQueries = {
  categories: async (
    _parent: unknown,
    args: { department?: Department; includeDisabled?: boolean }
  ) => {
    const session = await getSession();
    if (!session) return [];
    const prisma = await getPrisma();
    const ability = defineAbility(session);

    const includeDisabled = args.includeDisabled === true;
    if (includeDisabled) {
      assertCanManageTicketCategory(ability, "manage");
    }

    const categories = await getAllowedCategories(prisma, ability, { includeDisabled });

    if (args.department) {
      return categories.filter(
        (category) => category.department === args.department
      );
    }

    return categories;
  },

  categoryById: async (
    _parent: unknown,
    args: { id: number }
  ) => {
    const session = await getSession();
    if (!session) return null;
    const prisma = await getPrisma();
    const ability = defineAbility(session);

    const allowed = await getAllowedCategories(prisma, ability, {
      includeDisabled: ability.can("manage", "TicketCategory"),
    });

    const isAllowed = allowed.some((c) => c.id === args.id);
    if (!isAllowed) return null;

    return prisma.ticketCategory.findUnique({
      where: { id: args.id },
      select: { id: true, name: true, department: true, specificField: true, disabled: true },
    });
  },

  categoryAccesses: async (
    _parent: unknown,
    args: { categoryId?: number }
  ) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    assertCanManageTicketCategoryAccess(ability, "read");
    const prisma = await getPrisma();

    return prisma.ticketCategoryAccess.findMany({
      where: args.categoryId ? { categoryId: args.categoryId } : {},
      select: {
        id: true,
        categoryId: true,
        disabled: true,
        requesterDepartment: true,
        requesterMinRole: true,
      },
      orderBy: [{ categoryId: "desc" }, { id: "desc" }],
    });
  },
};