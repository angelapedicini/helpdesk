import type { PrismaAbility, Subjects as PrismaSubjects } from "@casl/prisma";
import type { User } from "@/app/generated/prisma/client";
import type { Department } from "@/app/generated/prisma/enums";

export type UserManagementActions = "updateRole" | "manageSpecialization" | "read";

// department opzionale: le condizioni su updateRole/manageSpecialization usano
// solo id/role, quindi i subject costruiti per quelle azioni non lo richiedono.
export type UserForAbility = Pick<User, "id" | "role"> & {
  department?: Department;
};

export type UserManagementSubjects = PrismaSubjects<{
  User: UserForAbility;
}>;

export type UserManagementAbility = PrismaAbility<
  [UserManagementActions, UserManagementSubjects]
>;