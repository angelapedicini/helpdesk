// lib/validators/ticket.schema.ts
import { z } from "zod";

export const TicketInputSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio").max(200),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  categoryId: z.coerce.number().int().positive("Categoria non valida"),
  assignedToId: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
});

export type TicketInput = z.infer<typeof TicketInputSchema>;

const optionalPositiveInt = z
  .union([z.coerce.number().int().positive(), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const TicketFilterSchema = z.object({
  createdById: optionalPositiveInt,
  assignedToId: optionalPositiveInt,
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).or(z.literal("")).optional()
    .transform((v) => (v === "" ? undefined : v)),
  categoryId: optionalPositiveInt,
});

export type TicketFilterInput = z.input<typeof TicketFilterSchema>;
export type TicketFilterOutput = z.output<typeof TicketFilterSchema>;