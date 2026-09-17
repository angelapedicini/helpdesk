import { accessibleBy } from "@casl/prisma";
import { GraphQLError } from "graphql/error";
import type { PrismaClient } from "@/app/generated/prisma/client";
import type { AppAbility } from "@/lib/casl/defineAbility";
import type { CategoryActions } from "./types";

export async function getAllowedCategoryIds(
  prisma: PrismaClient,
  ability: AppAbility
): Promise<number[]> {
  const categories = await prisma.ticketCategory.findMany({
    where: accessibleBy(ability, "read").ofType("TicketCategory"),
    select: { id: true },
  });

  return categories.map((c) => c.id);
}

export async function getAllowedCategories(
  prisma: PrismaClient,
  ability: AppAbility
) {
  return prisma.ticketCategory.findMany({
    where: accessibleBy(ability, "read").ofType("TicketCategory"),
    select: { id: true, name: true, department: true, specificField: true, disabled: true },
    orderBy: [{ department: "asc" }, { name: "asc" }],
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