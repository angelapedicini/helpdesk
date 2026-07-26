import { z } from "zod";

export const DepartmentEnum = z.enum(["HR", "IT", "FINANCE", "SALES", "MARKETING"]);

export const RegisterSchema = z.object({
  firstName: z.string().trim().min(1, "Il nome è obbligatorio"),
  lastName: z.string().trim().min(1, "Il cognome è obbligatorio"),
  email: z.email("Inserisci una email valida"),
  password: z.string()
    .min(8, "Deve contenere almeno 8 caratteri")
    .regex(/[A-Z]/, "Deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "Deve contenere almeno un numero")
    .regex(/[^a-zA-Z0-9]/, "Deve contenere almeno un carattere speciale"),
  department: DepartmentEnum
});

export const LoginSchema = z.object({
  email: z.email("Inserisci una email valida"),
  password: z.string()
    .min(8, "Deve contenere almeno 8 caratteri")
    .regex(/[A-Z]/, "Deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "Deve contenere almeno un numero")
    .regex(/[^a-zA-Z0-9]/, "Deve contenere almeno un carattere speciale")
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;