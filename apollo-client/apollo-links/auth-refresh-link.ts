// lib/apollo-client/auth-refresh-link.ts
import { ApolloLink, CombinedGraphQLErrors } from "@apollo/client";
import { from, mergeMap, catchError, throwError } from "rxjs";

type GqlError = { extensions?: Record<string, unknown> };

function isUnauthenticated(errors?: readonly GqlError[]) {
  return errors?.some((e) => e.extensions?.code === "UNAUTHENTICATED") ?? false;
}

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

// forza il redirect al login quando il refresh fallisce davvero
function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

export const authRefreshLink = new ApolloLink((operation, forward) => {
  if (["RefreshToken", "Login", "Register"].includes(operation.operationName ?? "")) {
    return forward(operation);
  }

  return forward(operation).pipe(
    mergeMap((result) => {
      if (isUnauthenticated(result.errors)) {
        return from(doRefresh()).pipe(
          mergeMap((ok) => {
            if (ok) return forward(operation);
            redirectToLogin();
            return [result];
          })
        );
      }
      return [result];
    }),
    catchError((error) => {
      if (CombinedGraphQLErrors.is(error) && isUnauthenticated(error.errors)) {
        return from(doRefresh()).pipe(
          mergeMap((ok) => {
            if (ok) return forward(operation);
            redirectToLogin();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
});