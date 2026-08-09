import { z } from "zod";
import { DepartmentEnum } from "./auth.schema";

export const TicketStatusSchema = z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "CLOSED", "REFUSED"]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const TicketPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export type TicketPriority = z.infer<typeof TicketPrioritySchema>;

// --- CREATE ---
export const TicketCreateSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio").max(200),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  categoryId: z.coerce.number().int().positive("Categoria non valida"),
  department: DepartmentEnum,
  // assignedToId: z.coerce
  //   .number()
  //   .int()
  //   .positive()
  //   .optional()
  //   .or(z.literal("").transform(() => undefined)),
});

export type TicketCreateInput = z.infer<typeof TicketCreateSchema>;

// --- UPDATE ---
// tutti i campi opzionali: ogni ruolo invia solo ciò che ha il permesso di toccare.
// assignedToId è nullable+optional per distinguere "non inviato" (undefined, non tocco)
// da "inviato esplicitamente vuoto" (null, scollega l'assegnatario).
// export const TicketUpdateSchema = z.object({
//   title: z.string().min(1, "Il titolo è obbligatorio").max(200).optional(),
//   description: z.string().min(1, "La descrizione è obbligatoria").optional(),
//   categoryId: z.coerce.number().int().positive("Categoria non valida").optional(),
//   assignedToId: z.coerce
//     .number()
//     .int()
//     .positive()
//     .nullable()
//     .optional()
//     .or(z.literal("").transform(() => null)),
//   status: TicketStatusSchema,
//   dueDate: z.coerce.date().nullable().optional(),
// });

// export type TicketUpdateInput = z.infer<typeof TicketUpdateSchema>;

// --- FILTER ---
// NB: erano tutti required nella versione precedente — un filtro con TUTTI i campi
// obbligatori non è utilizzabile (bisognerebbe sempre passare createdById E
// assignedToId E categoryId insieme). Li rendo tutti opzionali.
export const TicketFilterSchema = z.object({
  createdById: z.coerce.number().int().positive("Utente non valido").optional(),
  assignedToId: z.coerce.number().int().positive("Utente non valido").optional(),
  status: TicketStatusSchema.optional(),
  categoryId: z.coerce.number().int().positive("Categoria non valida").optional(),
});

export type TicketFilterInput = z.input<typeof TicketFilterSchema>;
export type TicketFilterOutput = z.output<typeof TicketFilterSchema>;