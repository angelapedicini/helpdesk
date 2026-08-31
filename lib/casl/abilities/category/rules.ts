import { AbilityBuilder } from "@casl/ability";
import { createPrismaAbility } from "@casl/prisma";
import { Role } from "@/app/generated/prisma/enums";
import type { CategoryAbility, CategoryAbilityBuilder, CategoryUser } from "./types";

const ROLE_RANK: Record<Role, number> = {
  EMPLOYEE: 1,
  TECHNICIAN: 2,
  ADMIN: 3,
};

function rolesAtOrBelow(role: Role): Role[] {
  const rank = ROLE_RANK[role];
  return (Object.keys(ROLE_RANK) as Role[]).filter((r) => ROLE_RANK[r] <= rank);
}

function defineCategoryRules({ can }: CategoryAbilityBuilder, user: CategoryUser) {
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

  if (user.role === "ADMIN") {
    can("manage", "TicketCategory", { department: user.department });
  }
}

export function defineAbilityForCategory(user: CategoryUser): CategoryAbility {
  const builder = new AbilityBuilder<CategoryAbility>(createPrismaAbility);
  defineCategoryRules(builder, user);
  return builder.build();
}