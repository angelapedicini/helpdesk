import { z } from "zod";

export const MessageInputSchema = z.object({
    string: z
        .string("Questo campo è obbligatorio")
        .min(1, "Questo campo è obbligatorio")
        .trim(),

});

export type MessageInput = z.infer<typeof MessageInputSchema>;