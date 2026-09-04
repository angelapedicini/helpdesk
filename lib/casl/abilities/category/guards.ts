import { accessibleBy } from "@casl/prisma";
import type { PrismaClient } from "@/app/generated/prisma/client";
import { defineAbilityForCategory } from "./rules";
import type { CategoryUser } from "./types";

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
    select: { id: true, name: true, department: true, specificField: true},
    orderBy: [{ department: "asc" }, { name: "asc" }],
  });
}