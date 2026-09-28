// lib/validators/ticket-message.schema.ts
import { z } from "zod";

// lib/validators/ticket-message.schema.ts
export const TicketMessageFormSchema = z.object({
  content: z
    .string("Questo campo è obbligatorio")
    .trim()
    .min(1, "Questo campo è obbligatorio")
    .max(500, "Il messaggio non può superare 5000 caratteri"),
});

export type TicketMessageFormInput = z.input<typeof TicketMessageFormSchema>;
export type TicketMessageFormOutput = z.output<typeof TicketMessageFormSchema>;