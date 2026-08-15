// lib/validators/ticket-detail.schema.ts
import { z } from "zod";
import { DepartmentEnum, TicketPrioritySchema, TicketStatusSchema } from "./enums.schema";


// Mirror 1:1 di `type Ticket` nel typeDefs GraphQL, tutti i campi opzionali.
// category / createdBy / assignedTo sono relation risolte in GraphQL:
// qui rappresentate come i rispettivi ID scalari (categoryId, createdById, assignedToId),
// unica forma editabile in un form.
// export const TicketDetailSchema = z.object({
//   title: z.string().min(1, "Il titolo è obbligatorio").max(200).optional(),
//   description: z.string().min(1, "La descrizione è obbligatoria").optional(),
//   status: TicketStatusSchema.optional(),
//   priority: TicketPrioritySchema.optional(),
//   categoryId: z.coerce.number().int().positive().nullable().optional(),
//   assignedToId: z.coerce.number().int().positive().nullable().optional(),

// });

// export type TicketDetailFormValues = z.input<typeof TicketDetailSchema>; // era z.infer
// export type TicketDetailFormOutput = z.output<typeof TicketDetailSchema>;

export const UpdateTicketSchema = z
  .object({
    title: z.string().min(1, "Questo campo deve contenere almeno un carattere").max(200).optional(),
    description: z.string().min(1, "Questo campo deve contenere almeno un carattere").optional(),
    status: TicketStatusSchema.optional(),
    priority: TicketPrioritySchema.optional(),
    categoryId: z.coerce.number().int().positive().nullable().optional(),
    assignedToId: z.coerce.number().int().positive().nullable().optional(),
    closingMessage: z.string().min(1, "Questo campo deve contenere almeno un carattere").optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.status === "CLOSED" || data.status === "REFUSED") &&
      !data.closingMessage
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Il messaggio di chiusura è obbligatorio quando il ticket viene chiuso o rifiutato",
        path: ["closingMessage"],
      });
    }
  });

export type UpdateTicketInput = z.input<typeof UpdateTicketSchema>; // era z.infer
export type UpdateTicketOutput = z.output<typeof UpdateTicketSchema>;


export const CreateTicketSchema = z.object({
  title: z.string().min(1, "Questo campo è obbligatorio").max(200),
  description: z.string().min(1, "Questo campo è obbligatorio"),
  priority: z.enum(TicketPrioritySchema.options, {
    message: "Questo campo è obbligatorio",
  }),
  categoryId: z.coerce.number().int().positive().optional(),
  department: DepartmentEnum
});

// lib/validators/ticket-detail.schema.ts — invariato lo schema, cambia solo l'export del tipo
export type CreateTicketFormValues = z.input<typeof CreateTicketSchema>; // era z.infer
export type CreateTicketFormOutput = z.output<typeof CreateTicketSchema>;



export const FilterTicketSchema = z.object({
  createdById: z.coerce.number().int().positive("Utente non valido").optional(),
  assignedToId: z.coerce.number().int().positive("Utente non valido").optional(),
  status: TicketStatusSchema.optional(),
  categoryId: z.coerce.number().int().positive("Categoria non valida").optional(),
  priority: TicketPrioritySchema.optional(),

  overdue: z.boolean().optional(),
  unassigned: z.boolean().optional(),

  dueDateFrom: z.coerce.date().optional().transform((d) => d?.toISOString()),
  dueDateTo: z.coerce.date().optional().transform((d) => d?.toISOString()),
});


export type FilterTicketInput = z.input<typeof FilterTicketSchema>;
export type FilterTicketOutput = z.output<typeof FilterTicketSchema>;
