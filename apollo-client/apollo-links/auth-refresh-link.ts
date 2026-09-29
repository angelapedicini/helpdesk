// lib/apollo-client/auth-refresh-link.ts
import { ApolloLink } from "@apollo/client";
import { from, mergeMap } from "rxjs";

type GqlError = { extensions?: Record<string, unknown> };

// "conflict" = un'altra richiesta ha già ruotato il token (race): non è un
// logout, basta riprovare con i cookie nuovi.
type RawOutcome = "ok" | "denied" | "error" | "conflict";
type RefreshOutcome = Exclude<RawOutcome, "conflict">;

const SKIP_OPERATIONS = ["RefreshToken", "Login", "Register"];
const RECENT_REFRESH_MS = 3_000;
const CONFLICT_RETRY_DELAY_MS = 300;

function hasCode(errors: readonly GqlError[] | undefined, code: string) {
  return errors?.some((e) => e.extensions?.code === code) ?? false;
}

function isUnauthenticated(errors?: readonly GqlError[]) {
  return hasCode(errors, "UNAUTHENTICATED");
}

// Una singola chiamata alla mutation di refresh, con esito classificato.
async function callRefresh(): Promise<RawOutcome> {
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
    if (hasCode(json.errors, "REFRESH_CONFLICT")) return "conflict";
    if (isUnauthenticated(json.errors)) return "denied";
    return "error";
  } catch {
    return "error"; // rete/parsing: NON è un motivo di logout
  }
}

// Se il server risponde REFRESH_CONFLICT, un'altra richiesta ha vinto la
// rotazione e i suoi cookie sono già (o stanno per essere) nel browser:
// si aspetta un attimo e si riprova UNA volta. Se il conflitto persiste il
// token è davvero invalido, quindi è un rifiuto.
async function callRefreshWithRetry(): Promise<RefreshOutcome> {
  const first = await callRefresh();
  if (first !== "conflict") return first;

  await new Promise((resolve) => setTimeout(resolve, CONFLICT_RETRY_DELAY_MS));

  const second = await callRefresh();
  return second === "conflict" ? "denied" : second;
}

let refreshing: Promise<RefreshOutcome> | null = null;
let lastRefreshOkAt = 0;

// Web Locks: un solo refresh alla volta anche tra tab diverse.
// I tipi di lib.dom dichiarano request<T>(name, cb: (lock) => T): Promise<T> e
// non modellano l'appiattimento delle promise: senza l'await qui sotto il tipo
// resterebbe Promise<Promise<RefreshOutcome>> e non compilerebbe.
async function refreshUnderLock(): Promise<RefreshOutcome> {
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    return await navigator.locks.request("auth-refresh", callRefreshWithRetry);
  }
  return callRefreshWithRetry();
}

function doRefresh(): Promise<RefreshOutcome> {
  if (!refreshing) {
    const run = refreshUnderLock();

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