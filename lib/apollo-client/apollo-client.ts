import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { notificationLink } from "./notification-link";
import { loadingLink } from "./loading-link";

const httpLink = new HttpLink({
  uri: "http://localhost:3000/api/graphql",
  credentials: "same-origin",
});

// tutti i campi Query che restituiscono liste gestite con cache.updateQuery
const listQueryFields = ["items", "users"] as const;

const replacePolicy = {
  merge(_existing: unknown, incoming: unknown) {
    return incoming;
  },
};

const queryFieldPolicies = Object.fromEntries(
  listQueryFields.map((field) => [field, replacePolicy])
);

export const client = new ApolloClient({
  link: ApolloLink.from([notificationLink, loadingLink, httpLink]),
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