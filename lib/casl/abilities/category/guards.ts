import { accessibleBy } from "@casl/prisma";
import { GraphQLError } from "graphql/error";
import type { PrismaClient } from "@/app/generated/prisma/client";
import { defineAbilityForCategory } from "./rules";
import type { CategoryAbility, CategoryActions, CategoryUser } from "./types";

export async function getAllowedCategoryIds(
  prisma: PrismaClient,
  user: CategoryUser
): Promise<number[]> {
  const ability = defineAbilityForCategory(user);

  const categories = await prisma.ticketCategory.findMany({
    where: accessibleBy(ability, "read").ofType("TicketCategory"),
    select: { id: true },
  });

  return categories.map((c) => c.id);
}

export async function getAllowedCategories(
  prisma: PrismaClient,
  user: CategoryUser
) {
  const ability = defineAbilityForCategory(user);

  return prisma.ticketCategory.findMany({
    where: accessibleBy(ability, "read").ofType("TicketCategory"),
    select: { id: true, name: true, department: true, specificField: true, disabled: true },
    orderBy: [{ department: "asc" }, { name: "asc" }],
  });
}

type CategoryManageAction = Extract<CategoryActions, "manage" | "read" | "create" | "update" | "delete" | "restore">;

export function assertCanManageTicketCategory(
  ability: CategoryAbility,
  action: CategoryManageAction
): void {
  if (ability.cannot(action, "TicketCategory")) {
    throw new GraphQLError("Non hai i permessi per gestire le categorie", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

export function assertCanManageTicketCategoryAccess(
  ability: CategoryAbility,
  action: CategoryManageAction
): void {
  if (ability.cannot(action, "TicketCategoryAccess")) {
    throw new GraphQLError("Non hai i permessi per gestire gli accessi alle categorie", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}