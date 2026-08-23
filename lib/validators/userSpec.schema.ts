import { z } from "zod";
import { RoleEnum, TicketPrioritySchema } from "./enums.schema";

export const FilterUserSpecSchema = z.object({
  userId: z.coerce.number().int().positive("Utente non valido").optional(),
  role: RoleEnum.optional(),
  categoryId: z.coerce.number().int().positive("Categoria non valida").optional(),
});

export type FilterUserSpecInput = z.input<typeof FilterUserSpecSchema>;
export type FilterUserSpecOutput = z.output<typeof FilterUserSpecSchema>;

export const CreateUserSpecSchema = z.object({
  userId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
});

// lib/validators/ticket-detail.schema.ts — invariato lo schema, cambia solo l'export del tipo
export type CreateUserSpecInput = z.input<typeof CreateUserSpecSchema>; // era z.infer
export type CreateUserSpecOutput = z.output<typeof CreateUserSpecSchema>;
