// import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
// import { notificationLink } from "./apollo-links/notification-link";
// import { loadingLink } from "./apollo-links/loading-link";
// import { authRefreshLink } from "./apollo-links/auth-refresh-link";

// const httpLink = new HttpLink({
//   uri: "http://localhost:3000/api/graphql",
//   credentials: "same-origin",
// });

// // tutti i campi Query che restituiscono liste gestite con cache.updateQuery
// const listQueryFields = ["items", "users"] as const;

// const replacePolicy = {
//   merge(_existing: unknown, incoming: unknown) {
//     return incoming;
//   },
// };

// const queryFieldPolicies = Object.fromEntries(
//   listQueryFields.map((field) => [field, replacePolicy])
// );

// export const client = new ApolloClient({
//   link: ApolloLink.from([notificationLink, loadingLink, authRefreshLink, httpLink]),
//   cache: new InMemoryCache({
//     typePolicies: {
//       Query: {
//         fields: queryFieldPolicies,
//       },
//     },
//   }),
//   defaultOptions: {
//     mutate: {
//       errorPolicy: "all",
//     },
//     watchQuery: {
//       errorPolicy: "all",
//     },
//   },
// });

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";
import { notificationLink } from "./apollo-links/notification-link";
import { loadingLink } from "./apollo-links/loading-link";
import { authRefreshLink } from "./apollo-links/auth-refresh-link";

const httpLink = new HttpLink({
  uri: "http://localhost:3000/api/graphql",
  credentials: "same-origin",
});

// Campi Query paginati con cursore (Connection/Edge/PageInfo) — merge automatico via relayStylePagination
const CURSOR_PAGINATED_FIELDS = ["tickets", "users", "categories"] as const;

// Campi Query che restituiscono liste semplici, senza paginazione cursor-based:
// ogni fetch sostituisce interamente il risultato precedente
const REPLACE_POLICY_FIELDS = ["items"] as const;

const replacePolicy = {
  merge(_existing: unknown, incoming: unknown) {
    return incoming;
  },
};

const queryFieldPolicies = {
  ...Object.fromEntries(CURSOR_PAGINATED_FIELDS.map((field) => [field, relayStylePagination()])),
  ...Object.fromEntries(REPLACE_POLICY_FIELDS.map((field) => [field, replacePolicy])),
};

export const client = new ApolloClient({
  link: ApolloLink.from([notificationLink, loadingLink, authRefreshLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: queryFieldPolicies,
      },
    },
  }),
  defaultOptions: {
    mutate: { errorPolicy: "all" },
    watchQuery: { errorPolicy: "all" },
  },
});