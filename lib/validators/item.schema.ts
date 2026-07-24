
// lib/validators/helper/helpers.ts
import { z, ZodType } from "zod";

export function optionalString<T extends ZodType>(innerSchema: T) {
    return z.preprocess(
        (val) => (val === "" ? undefined : val),
        innerSchema.nullable().optional(),
    );
}

export const EnumSchema = z.enum([
    "ACCETTATO",
    "RIFIUTATO",
    "ATTESA"
]);

export const ItemInputSchema = z.object({
    string: z
        .string("Questo campo è obbligatorio")
        .min(1, "Questo campo è obbligatorio")
        .trim(),

    optionalEasy: optionalString(z.string().trim()),

    numberDecimal: z
        .coerce.number("Questo campo è obbligatorio"),

    data: z
        .coerce.date("Questo campo è obbligatorio"),

    dataOptional: z
        .coerce.date()
        .nullable()
        .optional(),

    enum: EnumSchema.optional(),

  userId: z.coerce.number().int().positive(),


});
export const UpdateItemSchema = ItemInputSchema.partial();

export type CreateItemInput = z.infer<typeof ItemInputSchema>;
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;