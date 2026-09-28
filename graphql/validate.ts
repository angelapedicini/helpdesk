// graphql/validate.ts
import { GraphQLError } from "graphql/error";
import { z } from "zod";

// L'unico punto in cui l'input incontra Zod nel backend. Lo schema è lo stesso
// dei form (lib/validators), ma qui il messaggio è per lo sviluppatore, inglese,
// e all'utente arriva la traduzione del codice per il tramite di notificationLink.
export function parseOrThrow<S extends z.ZodType>(
  schema: S,
  value: unknown
): z.output<S> {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new GraphQLError("Invalid input", {
      extensions: {
        code: "BAD_USER_INPUT",
        issues: z.flattenError(result.error),
      },
    });
  }

  return result.data;
}

// I client GraphQL possono mandare esplicitamente null per campi nullable:
// per i filtri lo trattiamo come "chiave omessa", così lo schema resta
// identico ovunque.
export function stripNulls<T extends Record<string, unknown>>(value: T | null | undefined): Partial<T> {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(([, v]) => v !== null)
  ) as Partial<T>;
}