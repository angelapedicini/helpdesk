// lib/apollo-client/auth-refresh-link.ts
import { ApolloLink, CombinedGraphQLErrors } from "@apollo/client";
import { from, mergeMap, catchError, throwError } from "rxjs";

type GqlError = { extensions?: Record<string, unknown> };

function isUnauthenticated(errors?: readonly GqlError[]) {
  return errors?.some((e) => e.extensions?.code === "UNAUTHENTICATED") ?? false;
}

// mutex: se più query falliscono nello stesso istante, un solo refresh in volo
let refreshing: Promise<boolean> | null = null;

function doRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch("/api/graphql", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation RefreshToken { refreshToken { success } }`,
      }),
    })
      .then((res) => res.json())
      .then((json) => !json.errors && !!json.data?.refreshToken?.success)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export const authRefreshLink = new ApolloLink((operation, forward) => {
  // evita loop: non intercettare il refresh stesso o il login
  if (["RefreshToken", "Login", "Register"].includes(operation.operationName ?? "")) {
    return forward(operation);
  }

  return forward(operation).pipe(
    // caso 1: errori nel payload (errorPolicy: "all")
    mergeMap((result) => {
      if (isUnauthenticated(result.errors)) {
        return from(doRefresh()).pipe(
          mergeMap((ok) => (ok ? forward(operation) : [result]))
        );
      }
      return [result];
    }),
    // caso 2: errore lanciato (rete/CombinedGraphQLErrors)
    catchError((error) => {
      if (CombinedGraphQLErrors.is(error) && isUnauthenticated(error.errors)) {
        return from(doRefresh()).pipe(
          mergeMap((ok) => (ok ? forward(operation) : throwError(() => error)))
        );
      }
      return throwError(() => error);
    })
  );
});