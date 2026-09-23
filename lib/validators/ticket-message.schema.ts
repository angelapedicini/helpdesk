// lib/validators/ticket-message.schema.ts
import { z } from "zod";

export const TicketMessageFormSchema = z.object({
  content: z
    .string("Questo campo è obbligatorio")
    .min(1, "Questo campo è obbligatorio")
    .trim(),
});

export type TicketMessageFormInput = z.input<typeof TicketMessageFormSchema>;
export type TicketMessageFormOutput = z.output<typeof TicketMessageFormSchema>;