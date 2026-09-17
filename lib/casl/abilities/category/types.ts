import type { AbilityBuilder } from "@casl/ability";
import type { PrismaAbility, Subjects } from "@casl/prisma";
import type { TicketCategory, TicketCategoryAccess } from "@/app/generated/prisma/client";
import type { Department, Role } from "@/app/generated/prisma/enums";

export type CategoryActions =
  | "manage"
  | "read"
  | "create"
  | "update"
  | "delete"
  | "restore";

// Solo i campi scalari usati/selezionati; niente relazioni, per evitare
// che ExtractSubjectType (usato da accessibleBy) fallisca su tipi troppo
// complessi/ricorsivi, come già fatto per TicketForAbility.
export type CategoryForAbility = Pick<TicketCategory, "id" | "department" | "name">;

export type TicketCategoryAccessForAbility = Pick<
  TicketCategoryAccess,
  "id" | "categoryId"
>;

export type CategorySubjects = Subjects<{
  TicketCategory: CategoryForAbility;
  TicketCategoryAccess: TicketCategoryAccessForAbility;
}>;

export type CategoryAbility = PrismaAbility<[CategoryActions, CategorySubjects]>;

export type CategoryAbilityBuilder = Pick<
  AbilityBuilder<CategoryAbility>,
  "can" | "cannot"
>;

export type CategoryUser = {
  department: Department;
  role: Role;
};