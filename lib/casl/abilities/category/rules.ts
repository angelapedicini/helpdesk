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
  // ADMIN: gestione completa SOLO delle categorie del proprio
  // dipartimento (create, update, soft delete, riattivazione e
  // relativa matrice di accessi). Vengono usate azioni esplicite
  // e non "manage", così la lettura operativa resta governata
  // esclusivamente dalla matrice e la gestione dallo scope "update".
  // ------------------------------------------------------------
  if (user.role === "ADMIN") {
    can("create", "TicketCategory", { department: user.department });
    can("update", "TicketCategory", { department: user.department });
    can("delete", "TicketCategory", { department: user.department });
    can("restore", "TicketCategory", { department: user.department });
    can("read", "TicketCategoryAccess", {
      category: { department: user.department },
    });
  }

  // ------------------------------------------------------------
  // Tutti gli altri ruoli (e lo stesso ADMIN oltre alla gestione):
  // sola lettura, scoped SOLO sugli accessi espliciti della matrice
  // (grant attivi con ruolo minimo compatibile).
  // Nessuna visibilità automatica sulle categorie del proprio
  // dipartimento: la matrice è l'unica fonte di visibilità.
  // ------------------------------------------------------------
  const eligibleMinRoles = rolesAtOrBelow(user.role);

  can("read", "TicketCategory", {
    accessGrants: {
      some: {
        disabled: { not: true },
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