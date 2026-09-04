// lib/apollo-client/notification-link.ts
import { ApolloLink, CombinedGraphQLErrors, ServerError } from "@apollo/client";
import { tap, catchError, throwError } from "rxjs";
import { notify } from "./notification";

function isMutation(operation: import("@apollo/client").Operation) {
  return operation.query.definitions.some(
    (def) => def.kind === "OperationDefinition" && def.operation === "mutation"
  );
}

// Sostituisce {campo} nel messaggio con i valori del payload restituito dalla mutation
// Es: 'Ticket "{title}" creato con successo.' + { id: 42, title: "Stampante rotta" }
//     -> 'Ticket "Stampante rotta" creato con successo.'
function resolveMessageTemplate(template: string, payload: unknown): string {
  if (!payload || typeof payload !== "object") return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = (payload as Record<string, unknown>)[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

const graphqlErrorMessages: Record<string, string> = {
  UNAUTHENTICATED: "Devi effettuare l'accesso per continuare.",
  FORBIDDEN: "Non hai i permessi per questa operazione.",
  NOT_FOUND: "Elemento non trovato.",
  BAD_USER_INPUT: "I dati inseriti non sono validi.",
  EMAIL_ALREADY_EXISTS: "Questa email è già registrata.",
  INTERNAL_SERVER_ERROR: "Si è verificato un errore interno. Riprova più tardi.",
  WRONG_CREDENTIALS: "Password o email errati",
  SPECIFIC_VALUE_REQUIRED: "Inserire un valore per il campo specifica",
  NO_SPECIFIC_VALUE: "Non è possibile specificare un valore per una categoria che non lo preveda",
  ASSIGNED_TO_ERROR: "Non è possibile assegnare questo ticket a questo utente",
  WRONG_SPECIFIC: "Il valore della specifica non è corretto per la categoria",
  EMPTY_MESSAGE: "Il messaggio non può essere vuoto",

};

const httpErrorMessages: Record<number, string> = {
  400: "Richiesta non valida.",
  401: "Sessione scaduta. Effettua di nuovo l'accesso.",
  403: "Non hai i permessi per questa operazione.",
  404: "Risorsa non trovata.",
  500: "Errore del server. Riprova più tardi.",
  503: "Servizio momentaneamente non disponibile.",
};

export const notificationLink = new ApolloLink((operation, forward) => {
  return forward(operation).pipe(
    tap((result) => {
      const context = operation.getContext();

      // Errori GraphQL restituiti nel payload (non come eccezione)
      if (result.errors && result.errors.length > 0) {
        const code = result.errors[0]?.extensions?.code as string | undefined;
        notify(
          (code && graphqlErrorMessages[code]) ??
          result.errors[0]?.message ??
          "Si è verificato un errore.",
          "error"
        );
        return;
      }

      if (isMutation(operation) && !context.silent) {
        const rawMessage: string =
          context.successMessage ?? "Operazione completata con successo.";

        // Estrae il payload della mutation (prima chiave della response, es. data.createTicket)
        const mutationKey = result.data ? Object.keys(result.data)[0] : undefined;
        const payload = mutationKey
          ? (result.data as Record<string, unknown>)[mutationKey]
          : undefined;

        const finalMessage =
          typeof rawMessage === "string"
            ? resolveMessageTemplate(rawMessage, payload)
            : rawMessage;

        notify(finalMessage, "success");
      }
    }),
    catchError((error) => {
      // Qui arrivano solo errori di rete/server, non i GraphQLError dei resolver
      if (CombinedGraphQLErrors.is(error)) {
        const code = error.errors[0]?.extensions?.code as string | undefined;
        notify(
          (code && graphqlErrorMessages[code]) ??
          error.errors[0]?.message ??
          "Si è verificato un errore.",
          "error"
        );
      } else if (ServerError.is(error)) {
        notify(
          httpErrorMessages[error.statusCode] ??
          `Errore del server (${error.statusCode}).`,
          "error"
        );
      } else if (error) {
        notify(error.message ?? "Errore di rete. Controlla la connessione.", "error");
      }

      return throwError(() => error);
    })
  );
});