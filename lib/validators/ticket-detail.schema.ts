// lib/validators/ticket-detail.schema.ts
import { z } from "zod";
import { TicketStatusSchema } from "./ticket.schema";
import { DepartmentEnum } from "./auth.schema";

export const TicketPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

// Mirror 1:1 di `type Ticket` nel typeDefs GraphQL, tutti i campi opzionali.
// category / createdBy / assignedTo sono relation risolte in GraphQL:
// qui rappresentate come i rispettivi ID scalari (categoryId, createdById, assignedToId),
// unica forma editabile in un form.
export const TicketDetailSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio").max(200).optional(),
  description: z.string().min(1, "La descrizione è obbligatoria").optional(),
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  assignedToId: z.coerce.number().int().positive().nullable().optional(),

});

// lib/validators/ticket-detail.schema.ts — invariato lo schema, cambia solo l'export del tipo
export type TicketDetailFormValues = z.input<typeof TicketDetailSchema>; // era z.infer
export type TicketDetailFormOutput = z.output<typeof TicketDetailSchema>;