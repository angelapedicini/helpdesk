// lib/validators/user.schema.ts
import { z } from "zod";
import { RoleEnum } from "./enums.schema";

export const UpdateUserRoleSchema = z.object({
  userId: z.coerce.number().int().positive("Utente non valido"),
  role: RoleEnum,
});

export type UpdateUserRoleInput = z.input<typeof UpdateUserRoleSchema>;
export type UpdateUserRoleOutput = z.output<typeof UpdateUserRoleSchema>;

export const UpdateUserRoleFormSchema = z.object({
  role: RoleEnum,
});
export type UpdateUserRoleFormInput = z.input<typeof UpdateUserRoleFormSchema>;
export type UpdateUserRoleFormOutput = z.output<typeof UpdateUserRoleFormSchema>;