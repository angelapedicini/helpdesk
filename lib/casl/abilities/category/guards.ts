import { accessibleBy } from "@casl/prisma";
import { GraphQLError } from "graphql/error";
import type { PrismaClient } from "@/app/generated/prisma/client";
import type { AppAbility } from "@/lib/casl/defineAbility";
import type { CategoryActions } from "./types";

// Le categorie disattivate sono escluse dalla lettura per tutti (dashboard,
// form ticket, specializzazioni, validazioni di creazione/aggiornamento ticket).
// Chi le gestisce (SYSTEM_ADMIN, unico con "manage") può richiedere di vederle
// nei contesti di gestione/ripristino passando includeDisabled.
function categoryReadWhere(ability: AppAbility, includeDisabled = false) {
  const base = accessibleBy(ability, "read").ofType("TicketCategory");
  if (includeDisabled) return base;
  // "attiva": disabled è non-nullable (Boolean), quindi il predicato è esplicito.
  // La visibilità "operativa" richiede anche almeno un grant attivo: pure chi
  // gestisce (SYSTEM_ADMIN, per cui base è senza restrizioni) vede in dashboard,
  // form e filtri solo le categorie a cui è stata assegnata una visibilità.
  // Il catalogo completo (incluse quelle senza grant) resta accessibile solo
  // con includeDisabled=true, usato dalla pagina di gestione.
  return {
    AND: [
      base,
      { disabled: false },
      { accessGrants: { some: { disabled: false } } },
    ],
  } as const;
}

export type CategoryReadOptions = { includeDisabled?: boolean };

export async function getAllowedCategoryIds(
  prisma: PrismaClient,
  ability: AppAbility,
  options?: CategoryReadOptions
): Promise<number[]> {
  const categories = await prisma.ticketCategory.findMany({
    where: categoryReadWhere(ability, options?.includeDisabled),
    select: { id: true },
  });

  return categories.map((c) => c.id);
}

export async function getAllowedCategories(
  prisma: PrismaClient,
  ability: AppAbility,
  options?: CategoryReadOptions
) {
  return prisma.ticketCategory.findMany({
    where: categoryReadWhere(ability, options?.includeDisabled),
    select: { id: true, name: true, department: true, specificField: true, disabled: true },
    orderBy: [{ id: "desc" }, { name: "asc" }],
  });
}

type CategoryManageAction = Extract<CategoryActions, "manage" | "read" | "create" | "update" | "delete" | "restore">;

export function assertCanManageTicketCategory(
  ability: AppAbility,
  action: CategoryManageAction
): void {
  if (ability.cannot(action, "TicketCategory")) {
    throw new GraphQLError("Non hai i permessi per gestire le categorie", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

export function assertCanManageTicketCategoryAccess(
  ability: AppAbility,
  action: CategoryManageAction
): void {
  if (ability.cannot(action, "TicketCategoryAccess")) {
    throw new GraphQLError("Non hai i permessi per gestire gli accessi alle categorie", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}