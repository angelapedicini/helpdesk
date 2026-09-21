import { getPrisma } from "@/lib/prisma/index";
import { getSession, requireSession } from "@/lib/auth/session";
import { Department } from "@/app/generated/prisma/enums";
import {
  getAllowedCategories,
  isUnrestrictedCategoryManager,
  isDepartmentCategoryManager,
  assertCategoryManagerForDepartment,
} from "@/lib/casl/abilities/category/guards";
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
      assertCategoryManagerForDepartment(ability, session.department);
    }

    // includeDisabled (contesti di gestione): il department è imposto dal
    // resolver, mai dall'input. L'ADMIN vede solo le categorie del proprio
    // reparto (incluse le disabilitate); SYSTEM_ADMIN mantiene il catalogo
    // completo. Senza includeDisabled la lettura resta operativa (matrice).
    const unrestricted = isUnrestrictedCategoryManager(ability);
    const categories = includeDisabled
      ? await getAllowedCategories(prisma, ability,
          unrestricted
            ? { includeDisabled: true }
            : { departmentScope: session.department }
        )
      : await getAllowedCategories(prisma, ability);

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

    const category = await prisma.ticketCategory.findUnique({
      where: { id: args.id },
      select: { id: true, name: true, department: true, specificField: true, disabled: true },
    });
    if (!category) return null;

    const unrestricted = isUnrestrictedCategoryManager(ability);
    const scopedManager = isDepartmentCategoryManager(
      ability,
      session.department
    );

    if (unrestricted || scopedManager) {
      // Gestione: SYSTEM_ADMIN vede tutto, l'ADMIN solo il proprio reparto
      // (incluso disabilitate). Un ADMIN che apre una categoria di un altro
      // reparto ricade sul criterio di lettura operativa (matrice).
      const manageable = await getAllowedCategories(prisma, ability,
        unrestricted
          ? { includeDisabled: true }
          : { departmentScope: session.department }
      );
      if (manageable.some((c) => c.id === args.id)) return category;
    }

    // Lettura operativa: solo categorie attive visibili via matrice.
    const allowed = await getAllowedCategories(prisma, ability);
    if (!allowed.some((c) => c.id === args.id)) return null;

    return category;
  },

  categoryAccesses: async (
    _parent: unknown,
    args: { categoryId?: number }
  ) => {
    const session = await requireSession();
    const ability = defineAbility(session);
    assertCategoryManagerForDepartment(ability, session.department);
    const prisma = await getPrisma();

    // L'ADMIN vede solo i grant delle categorie del proprio reparto;
    // SYSTEM_ADMIN li vede tutti.
    const scopeWhere = isUnrestrictedCategoryManager(ability)
      ? {}
      : { category: { department: session.department } };

    return prisma.ticketCategoryAccess.findMany({
      where: args.categoryId
        ? { categoryId: args.categoryId, ...scopeWhere }
        : scopeWhere,
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