import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";

import { notificationLink } from "./apollo-links/notification-link";
import { loadingLink } from "./apollo-links/loading-link";
import { authRefreshLink } from "./apollo-links/auth-refresh-link";
import { BASE_PATH } from "@/lib/base-path";

/**
 * Campi Query paginati con cursor pagination
 * (Connection / Edge / PageInfo).
 *
 * Per ogni campo specifichiamo i `keyArgs`: gli argomenti
 * che identificano dataset diversi (e quindi liste diverse
 * in cache). `first`/`after` NON vanno mai inclusi: sono
 * parametri di paginazione, non di identità della lista.
 *
 * Un array vuoto significa "nessun keyArg oltre ai default
 * di relayStylePagination()".
 */
const CURSOR_PAGINATED_FIELDS_CONFIG = {
  tickets: ["orderBy", "filter", "scope"],
  ticketHistory: ["ticketId"],
  users: [],
  categories: [],
  messages: ["ticketId"],
} as const;

/**
 * Campi Query che restituiscono liste semplici,
 * senza cursor pagination.
 *
 * Ogni nuova risposta sostituisce completamente
 * quella precedente.
 */
const REPLACE_POLICY_FIELDS = ["items"] as const;

/**
 * Policy per le liste semplici.
 */
const replacePolicy = {
  merge(_existing: unknown, incoming: unknown) {
    return incoming;
  },
};

/**
 * Policy per i campi paginati, generate a partire da
 * CURSOR_PAGINATED_FIELDS_CONFIG.
 */
const cursorPaginationPolicies = Object.fromEntries(
  Object.entries(CURSOR_PAGINATED_FIELDS_CONFIG).map(([field, keyArgs]) => [
    field,
    relayStylePagination(keyArgs.length ? [...keyArgs] : undefined),
  ])
);

const readFromCachePolicy = (typename: string) => ({
  read(existing: unknown, { args, toReference }: any) {
    return existing ?? toReference({ __typename: typename, id: args?.id });
  },
});

const queryFieldPolicies = {
  ...cursorPaginationPolicies,

  ...Object.fromEntries(
    REPLACE_POLICY_FIELDS.map((field) => [field, replacePolicy])
  ),

  categoryById: readFromCachePolicy("TicketCategory"),
};

export function createApolloClient() {
  const httpLink = new HttpLink({
    uri: `${BASE_PATH}/api/graphql`,
    credentials: "same-origin",
  });

  return new ApolloClient({
    link: ApolloLink.from([
      notificationLink,
      loadingLink,
      authRefreshLink,
      httpLink,
    ]),

    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: queryFieldPolicies,
        },
      },
    }),

    defaultOptions: {
      mutate: {
        errorPolicy: "all",
      },

      watchQuery: {
        errorPolicy: "all",
      },
    },
  });
}