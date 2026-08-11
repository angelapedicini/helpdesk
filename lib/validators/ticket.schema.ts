// import { z } from "zod";
// import { DepartmentEnum, TicketPrioritySchema, TicketStatusSchema } from "./enums.schema";


// // --- CREATE ---
// export const TicketCreateSchema = z.object({
//   title: z.string().min(1, "Il titolo è obbligatorio").max(200),
//   description: z.string().min(1, "La descrizione è obbligatoria"),
//   categoryId: z.coerce.number().int().positive("Categoria non valida"),
//   department: DepartmentEnum,
//   // assignedToId: z.coerce
//   //   .number()
//   //   .int()
//   //   .positive()
//   //   .optional()
//   //   .or(z.literal("").transform(() => undefined)),
// });

// export type TicketCreateInput = z.infer<typeof TicketCreateSchema>;

// export const TicketFilterSchema = z.object({
//   createdById: z.coerce.number().int().positive("Utente non valido").optional(),
//   assignedToId: z.coerce.number().int().positive("Utente non valido").optional(),
//   status: TicketStatusSchema.optional(),
//   categoryId: z.coerce.number().int().positive("Categoria non valida").optional(),
// });


// export type TicketFilterInput = z.input<typeof TicketFilterSchema>;
// export type TicketFilterOutput = z.output<typeof TicketFilterSchema>;

// export const FilterTicketSchema = z.object({
//   createdById: z.coerce.number().int().positive("Utente non valido").optional(),
//   assignedToId: z.coerce.number().int().positive("Utente non valido").optional(),
//   status: TicketStatusSchema.optional(),
//   categoryId: z.coerce.number().int().positive("Categoria non valida").optional(),
//   priority: TicketPrioritySchema.optional(),
// });


// export type FilterTicketInput = z.input<typeof FilterTicketSchema>;
// export type FilterTicketOutput = z.output<typeof FilterTicketSchema>;
