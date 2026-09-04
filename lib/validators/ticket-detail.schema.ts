// lib/validators/ticket-detail.schema.ts
import { z } from "zod";
import { DepartmentEnum, TicketPrioritySchema, TicketStatusSchema } from "./enums.schema";

export const UpdateTicketSchema = z
  .object({
    title: z.string().min(1, "Questo campo deve contenere almeno un carattere").max(200).optional(),
    description: z.string().min(1, "Questo campo deve contenere almeno un carattere").optional(),
    status: TicketStatusSchema.optional(),
    priority: TicketPrioritySchema.optional(),
    categoryId: z.coerce.number().int().positive().nullable().optional(),
    assignedToId: z.coerce.number().int().positive().nullable().optional(),
    closingMessage: z.string().min(1, "Questo campo deve contenere almeno un carattere").optional(),
    dueDate: z.coerce.date().optional(),
    specificValue: z.string().min(1).optional(),
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

    if (data.dueDate !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (data.dueDate < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La scadenza non può essere nel passato",
          path: ["dueDate"],
        });
      }
    }

    // Un ticket portato esplicitamente a "nessuna categoria" non può avere
    // uno specificValue: a prescindere da quale fosse la categoria prima,
    // non esiste un campo dinamico da valorizzare senza categoria.
    // (La regola opposta — "categoria X richiede specificValue" — non è
    // verificabile qui perché dipende dal DB: resta responsabilità del resolver.)
    if (data.categoryId === null && data.specificValue !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Non è possibile specificare un valore senza una categoria",
        path: ["specificValue"],
      });
    }
  });

export type UpdateTicketInput = z.input<typeof UpdateTicketSchema>;
export type UpdateTicketOutput = z.output<typeof UpdateTicketSchema>;


export const CreateTicketSchema = z.object({
  title: z.string().min(1, "Questo campo è obbligatorio").max(200),
  description: z.string().min(1, "Questo campo è obbligatorio"),
  priority: z.enum(TicketPrioritySchema.options, {
    message: "Questo campo è obbligatorio",
  }),
  categoryId: z.coerce.number().int().positive().optional(),
  department: DepartmentEnum,
  specificValue: z.string().min(1).optional(),
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
