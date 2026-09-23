// lib/validators/ticket-detail.schema.ts
import { z } from "zod";
import { DepartmentEnum, TicketPrioritySchema, TicketStatusSchema } from "./enums.schema";
import type { TicketSpecificField } from "./enums.schema";
import { createSpecificValueField } from "./specific-value.schema";

function updateTicketBase(specificField?: TicketSpecificField | null) {
  return z.object({
    title: z.string().min(1, "Questo campo deve contenere almeno un carattere").max(200).optional(),
    description: z.string().min(1, "Questo campo deve contenere almeno un carattere").optional(),
    status: TicketStatusSchema.optional(),
    priority: TicketPrioritySchema.optional(),
    categoryId: z.coerce.number().int().positive().nullable().optional(),
    assignedToId: z.coerce.number().int().positive().nullable().optional(),
    closingMessage: z.string().min(1, "Questo campo deve contenere almeno un carattere").optional(),
    dueDate: z.coerce.date().optional(),
    specificValue: createSpecificValueField(specificField),
    reopenReason: z.string().min(1, "Questo campo deve contenere almeno un carattere").optional(),
  });
}

function withUpdateTicketRefinements<T extends ReturnType<typeof updateTicketBase>>(schema: T) {
  return schema
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

      // La riapertura (CLOSED -> REOPENED) richiede sempre un motivo.
      // Il resolver ricontrolla comunque (REOPEN_REASON_REQUIRED) come difesa
      // in profondità, perché qui vediamo solo l'input e non lo status a DB.
      if (data.status === "REOPENED" && !data.reopenReason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Il motivo della riapertura è obbligatorio quando il ticket viene riaperto",
          path: ["reopenReason"],
        });
      }

      // Durante la riapertura (CLOSED -> REOPENED) la dueDate può essere già
      // scaduta: è quella della vita precedente del ticket, e verrà ricalcolata
      // dal backend quando il tecnico passerà a IN_PROGRESS.
      if (data.dueDate !== undefined && data.status !== "REOPENED") {
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

      if (data.categoryId === null && data.specificValue !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Non è possibile specificare un valore senza una categoria",
          path: ["specificValue"],
        });
      }
    });
}

// Schema generico (nessun formato specifico), usato dal backend per il
// parse iniziale dell'input: il formato viene controllato dopo il lookup
// della categoria. Nei form del frontend si usa createUpdateTicketSchema,
// che conosce lo specificField della categoria selezionata.
export const UpdateTicketSchema = withUpdateTicketRefinements(updateTicketBase());

export function createUpdateTicketSchema(specificField?: TicketSpecificField | null) {
  return withUpdateTicketRefinements(updateTicketBase(specificField));
}

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

// Come CreateTicketSchema ma con il formato della specifica applicato
// quando il campo della categoria lo prevede (usato dal form di creazione).
export function createCreateTicketSchema(specificField?: TicketSpecificField | null) {
  return CreateTicketSchema.extend({
    specificValue: createSpecificValueField(specificField),
  });
}

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

  firstResponseOverdue: z.boolean().optional(),
  reopened: z.boolean().optional(),

  firstResponseDueSoon: z.boolean().optional(),
  dueDateDueSoon: z.boolean().optional(),

  dueDateFrom: z.coerce.date().optional().transform((d) => d?.toISOString()).optional(),
  dueDateTo: z.coerce.date().optional().transform((d) => d?.toISOString()).optional(),
});


export type FilterTicketInput = z.input<typeof FilterTicketSchema>;
export type FilterTicketOutput = z.output<typeof FilterTicketSchema>;
