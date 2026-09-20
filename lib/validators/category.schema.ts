// lib/validators/category.schema.ts
import { z } from "zod";
import { DepartmentEnum, RoleEnum, TicketSpecificFieldSchema } from "./enums.schema";

export const CreateTicketCategorySchema = z.object({
  name: z.string().min(1, "Questo campo è obbligatorio").max(120),
  department: DepartmentEnum,
  specificField: TicketSpecificFieldSchema,
});

export const UpdateTicketCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Questo campo deve contenere almeno un carattere")
    .max(120)
    .optional(),
  specificField: TicketSpecificFieldSchema.optional(),
});

export const CreateTicketCategoryAccessSchema = z.object({
  categoryId: z.coerce.number().int().positive("Categoria non valida"),
  requesterDepartment: DepartmentEnum.nullable().optional(),
  requesterMinRole: RoleEnum,
});

export type CreateTicketCategoryInput = z.input<typeof CreateTicketCategorySchema>;
export type CreateTicketCategoryOutput = z.output<typeof CreateTicketCategorySchema>;

export type UpdateTicketCategoryInput = z.input<typeof UpdateTicketCategorySchema>;
export type UpdateTicketCategoryOutput = z.output<typeof UpdateTicketCategorySchema>;

export type CreateTicketCategoryAccessInput = z.input<typeof CreateTicketCategoryAccessSchema>;
export type CreateTicketCategoryAccessOutput = z.output<typeof CreateTicketCategoryAccessSchema>;

export const CategoryFormSchema = z.object({
  name: z.string().min(1, "Questo campo è obbligatorio").max(120),
  department: z.enum(DepartmentEnum.options, {
    error: (issue) =>
      issue.input === undefined ? "Seleziona un reparto" : "Reparto non valido",
  }),
  specificField: z.enum(TicketSpecificFieldSchema.options, {
    error: (issue) =>
      issue.input === undefined ? "Seleziona un reparto" : "Reparto non valido",
  }),
});
export type CategoryFormInput = z.input<typeof CategoryFormSchema>;
export type CategoryFormOutput = z.output<typeof CategoryFormSchema>;

export const UpdateCategoryFormSchema = z.object({
  name: z.string().min(1, "Questo campo è obbligatorio").max(120),
  specificField: TicketSpecificFieldSchema,
});
export type UpdateCategoryFormInput = z.input<typeof UpdateCategoryFormSchema>;
export type UpdateCategoryFormOutput = z.output<typeof UpdateCategoryFormSchema>;

export const CategoryAccessFormSchema = z.object({
  requesterDepartment: DepartmentEnum.or(z.literal("")).nullable(),
  requesterMinRole: RoleEnum,
});
export type CategoryAccessFormInput = z.input<typeof CategoryAccessFormSchema>;
export type CategoryAccessFormOutput = z.output<typeof CategoryAccessFormSchema>;