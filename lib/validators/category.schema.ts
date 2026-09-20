// lib/validators/category.schema.ts
import { z } from "zod";
import { DepartmentEnum, RoleEnum, TicketSpecificFieldSchema } from "./enums.schema";

export const CreateTicketCategorySchema = z.object({
  name: z.string().min(1, "Questo campo è obbligatorio").max(120),
  department: DepartmentEnum,
  specificField: TicketSpecificFieldSchema.optional(),
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

export const UpdateCategoryAccessGrantSchema = z.object({
  requesterDepartment: DepartmentEnum.nullable(),
  requesterMinRole: RoleEnum,
});

export const UpdateCategorySchema = UpdateTicketCategorySchema.extend({
  accessGrants: z.array(UpdateCategoryAccessGrantSchema).max(10).optional(),
});

export type CreateTicketCategoryInput = z.input<typeof CreateTicketCategorySchema>;
export type CreateTicketCategoryOutput = z.output<typeof CreateTicketCategorySchema>;

export type UpdateTicketCategoryInput = z.input<typeof UpdateTicketCategorySchema>;
export type UpdateTicketCategoryOutput = z.output<typeof UpdateTicketCategorySchema>;

export type CreateTicketCategoryAccessInput = z.input<typeof CreateTicketCategoryAccessSchema>;
export type CreateTicketCategoryAccessOutput = z.output<typeof CreateTicketCategoryAccessSchema>;

export type UpdateCategoryAccessGrantInput = z.input<typeof UpdateCategoryAccessGrantSchema>;
export type UpdateCategoryAccessGrantOutput = z.output<typeof UpdateCategoryAccessGrantSchema>;

export type UpdateCategoryInput = z.input<typeof UpdateCategorySchema>;
export type UpdateCategoryOutput = z.output<typeof UpdateCategorySchema>;

export const CategoryFormSchema = z.object({
  name: z.string().min(1, "Questo campo è obbligatorio").max(120),
  department: z.enum(DepartmentEnum.options, {
    error: (issue) =>
      issue.input === undefined ? "Seleziona un reparto" : "Reparto non valido",
  }),
  // specificField: z.enum(TicketSpecificFieldSchema.options, {
  //   error: (issue) =>
  //     issue.input === undefined ? "Seleziona un reparto" : "Reparto non valido",
  // }),
  specificField: TicketSpecificFieldSchema.optional()
});
export type CategoryFormInput = z.input<typeof CategoryFormSchema>;
export type CategoryFormOutput = z.output<typeof CategoryFormSchema>;

export const CategoryDetailAccessRowSchema = RoleEnum.or(z.literal(""));

export const CategoryDetailFormSchema = z.object({
  name: z.string().min(1, "Questo campo è obbligatorio").max(120),
  specificField: TicketSpecificFieldSchema,
  access: z.object({
    FINANCE: CategoryDetailAccessRowSchema,
    HR: CategoryDetailAccessRowSchema,
    IT: CategoryDetailAccessRowSchema,
    LOGISTIC: CategoryDetailAccessRowSchema,
    SUPPORT: CategoryDetailAccessRowSchema,
    ALL: CategoryDetailAccessRowSchema,
  }),
});
export type CategoryDetailFormInput = z.input<typeof CategoryDetailFormSchema>;
export type CategoryDetailFormOutput = z.output<typeof CategoryDetailFormSchema>;