import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import { Role } from "@/app/generated/prisma/enums";
import type { CategoryAbility, CategoryAbilityBuilder, CategoryUser } from "./types";

const ROLE_RANK: Record<Role, number> = {
  EMPLOYEE: 1,
  TECHNICIAN: 2,
  ADMIN: 3,
  SYSTEM_ADMIN: 4,
};

function rolesAtOrBelow(role: Role): Role[] {
  const rank = ROLE_RANK[role];
  return (Object.keys(ROLE_RANK) as Role[]).filter((r) => ROLE_RANK[r] <= rank);
}

function defineCategoryRules({ can }: CategoryAbilityBuilder, user: CategoryUser) {
  // ------------------------------------------------------------
  // SYSTEM_ADMIN: gestione completa (create, update, soft delete,
  // riattivazione). Nessuna restrizione di dipartimento: la
  // configurazione delle categorie è trasversale.
  // ------------------------------------------------------------
  if (user.role === "SYSTEM_ADMIN") {
    can("manage", "TicketCategory");
    can("manage", "TicketCategoryAccess");
    return; // le regole sotto sono ridondanti per lui, non serve valutarle
  }

  // ------------------------------------------------------------
  // Tutti gli altri ruoli: sola lettura, scoped per dipartimento
  // o per accessGrant esplicito.
  // ------------------------------------------------------------
  const eligibleMinRoles = rolesAtOrBelow(user.role);

  can("read", "TicketCategory", { department: user.department });

  can("read", "TicketCategory", {
    accessGrants: {
      some: {
        OR: [
          { requesterDepartment: user.department },
          { requesterDepartment: null },
        ],
        requesterMinRole: { in: eligibleMinRoles },
      },
    },
  });
}

export function defineAbilityForCategory(user: CategoryUser): CategoryAbility {
  const builder = new AbilityBuilder<CategoryAbility>(createPrismaAbility);
  defineCategoryRules(builder, user);
  return builder.build();
}