import type { PrismaAbility, Subjects as PrismaSubjects } from "@casl/prisma";
import type { User } from "@/app/generated/prisma/client";
import type { Department } from "@/app/generated/prisma/enums";

export type UserManagementActions = "updateRole" | "manageSpecialization" | "read";

// department serve ad applicare la condizione di manageSpecialization
// (l'admin gestisce i tecnici del proprio dipartimento). È quindi
// necessario nei subject costruiti per quella azione; per updateRole
// (che usa solo id/role) resta opzionale.
export type UserForAbility = Pick<User, "id" | "role"> & {
  department?: Department;
};

export type UserManagementSubjects = PrismaSubjects<{
  User: UserForAbility;
}>;

export type UserManagementAbility = PrismaAbility<
  [UserManagementActions, UserManagementSubjects]
>;