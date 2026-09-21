// lib/validators/specific-value.schema.ts
import { z } from "zod";
import type { TicketSpecificField } from "./enums.schema";

// Formati "di riferimento" per i campi specifici a testo libero.
// Non esiste un sistema esterno (fatture, buste paga, spedizioni) a cui
// chiedere conferma che il riferimento esista, quindi la validazione si
// limita alla forma: preambolo fisso + numeri.
const REFERENCE_FORMATS: Partial<
  Record<TicketSpecificField, { regex: RegExp; message: string; preview: string }>
> = {
  PAYROLL_REFERENCE: {
    regex: /^PAY-\d{4}$/,
    message: "Formato non valido: usa PAY-#### (es. PAY-0042)",
    preview: "PAY-0042",
  },
  INVOICE_REFERENCE: {
    regex: /^INV-\d{4}$/,
    message: "Formato non valido: usa INV-#### (es. INV-1234)",
    preview: "INV-1234",
  },
  SHIPMENT_REFERENCE: {
    regex: /^SHP-\d{4}-\d+$/,
    message: "Formato non valido: usa SHP-AAAA-## con anno (es. SHP-2026-25)",
    preview: "SHP-2026-25",
  },
};

export function getSpecificReferencePreview(
  specificField: TicketSpecificField | null | undefined
): string | null {
  return specificField
    ? REFERENCE_FORMATS[specificField]?.preview ?? null
    : null;
}

export function getSpecificReferenceFormat(
  specificField: TicketSpecificField | null | undefined
): { regex: RegExp; message: string } | null {
  return specificField
    ? REFERENCE_FORMATS[specificField] ?? null
    : null;
}

// Restituisce il messaggio d'errore se il valore non rispetta il formato,
// altrimenti null. I valori null/undefined (specifica non valorizzata)
// passano sempre: l'obbligatorietà è gestita altrove, qui conta solo la forma.
export function validateSpecificValueFormat(
  specificField: TicketSpecificField | null | undefined,
  value: string | null | undefined
): string | null {
  if (value == null) return null;
  const format = getSpecificReferenceFormat(specificField);
  if (!format) return null;
  return format.regex.test(value) ? null : format.message;
}

// Schema del campo "specificValue" per i form dei ticket: opzionale, con il
// controllo di formato applicato solo se il campo della categoria lo prevede.
export function createSpecificValueField(
  specificField: TicketSpecificField | null | undefined
) {
  return z
    .string()
    .min(1)
    .optional()
    .superRefine((value, ctx) => {
      const message = validateSpecificValueFormat(specificField, value);
      if (message) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
        });
      }
    });
}