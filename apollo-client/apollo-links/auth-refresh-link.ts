// lib/apollo-client/auth-refresh-link.ts
import { ApolloLink } from "@apollo/client";
import { from, mergeMap } from "rxjs";

type GqlError = { extensions?: Record<string, unknown> };
type RefreshOutcome = "ok" | "denied" | "error";

const SKIP_OPERATIONS = ["RefreshToken", "Login", "Register"];
const RECENT_REFRESH_MS = 3_000;

function isUnauthenticated(errors?: readonly GqlError[]) {
  return errors?.some((e) => e.extensions?.code === "UNAUTHENTICATED") ?? false;
}

async function callRefresh(): Promise<RefreshOutcome> {
  try {
    const res = await fetch("/api/graphql", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation RefreshToken { refreshToken { success } }`,
      }),
    });
    if (!res.ok) return "error";

    const json = await res.json();
    if (json.data?.refreshToken?.success) return "ok";
    return isUnauthenticated(json.errors) ? "denied" : "error";
  } catch {
    return "error"; // rete/parsing: NON è un motivo di logout
  }
}

let refreshing: Promise<RefreshOutcome> | null = null;
let lastRefreshOkAt = 0;

function doRefresh(): Promise<RefreshOutcome> {
  if (!refreshing) {
    // Web Locks: un solo refresh alla volta anche tra tab diverse
    const run =
      typeof navigator !== "undefined" && "locks" in navigator
        ? navigator.locks.request("auth-refresh", callRefresh)
        : callRefresh();

    refreshing = run
      .then((outcome) => {
        if (outcome === "ok") lastRefreshOkAt = Date.now();
        return outcome;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

// Se un refresh è appena riuscito, la richiesta fallita era partita con il
// token vecchio: basta riprovarla, senza ruotare di nuovo.
async function ensureFreshToken(): Promise<RefreshOutcome> {
  if (!refreshing && Date.now() - lastRefreshOkAt < RECENT_REFRESH_MS) {
    return "ok";
  }
  return doRefresh();
}

function redirectToLogin() {
  if (typeof window !== "undefined") window.location.href = "/";
}

export const authRefreshLink = new ApolloLink((operation, forward) => {
  if (SKIP_OPERATIONS.includes(operation.operationName ?? "")) {
    return forward(operation);
  }

  return forward(operation).pipe(
    mergeMap((result) => {
      if (!isUnauthenticated(result.errors)) return [result];

      return from(ensureFreshToken()).pipe(
        mergeMap((outcome) => {
          if (outcome === "ok") return forward(operation); // un solo retry
          if (outcome === "denied") redirectToLogin();     // logout vero
          return [result]; // "error": mostra l'errore, ma non sloggare
        })
      );
    })
  );
});