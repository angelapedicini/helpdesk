import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, nessuna dipendenza esterna)
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 150;
const BAN_DURATION_MS = 5 * 60_000; // 5 minuti

type RateLimitEntry = { count: number; windowStart: number };

const requestCounts = new Map<string, RateLimitEntry>();
const bannedIps = new Map<string, number>(); // ip -> timestamp di scadenza ban

function checkRateLimit(ip: string): NextResponse | null {
  const now = Date.now();

  // controlla se l'IP è attualmente bannato
  const banExpiry = bannedIps.get(ip);
  if (banExpiry) {
    if (now < banExpiry) {
      return NextResponse.json(
        { error: "Troppe richieste. Riprova tra qualche minuto." },
        { status: 429 }
      );
    }
    bannedIps.delete(ip); // ban scaduto, pulizia
  }

  const entry = requestCounts.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // nuova finestra
    requestCounts.set(ip, { count: 1, windowStart: now });
    return null;
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    bannedIps.set(ip, now + BAN_DURATION_MS);
    requestCounts.delete(ip);
    return NextResponse.json(
      { error: "Troppe richieste. Bloccato per 5 minuti." },
      { status: 429 }
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Configurazione path
// ---------------------------------------------------------------------------

// 1. Pubblici — accessibili senza token
const PUBLIC_PATHS = [
  "/",
  "/api/graphql", // <-- il vecchio endpoint /api/auth/login, /refresh, /register erano pubblici
                  //     ora tutto passa da qui: login/register/refresh sono mutation pubbliche,
                  //     le query/mutation protette restano protette a livello di resolver
];

// 3. Protetti per ruolo — richiedono token + ruolo specifico
//questo si potrebbe togleire xk gestito in modo diverso adesso
const ROLE_PROTECTED_PATHS: { path: string; roles: string[] }[] = [
  { path: "/stats", roles: ["ADMIN", "SYSTEM_ADMIN"] },
];

// path su cui la navbar non deve apparire
export const NAVBAR_HIDDEN_PATHS = [
  "/",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function matchesPath(pathname: string, paths: string[]) {
  return paths.some((p) =>
    p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p + "/")
  );
}

function matchesRolePath(pathname: string) {
  return ROLE_PROTECTED_PATHS.find(
    ({ path }) => pathname === path || pathname.startsWith(path + "/")
  );
}

function handleUnauthenticated(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const homeUrl = new URL("/", req.url);
  homeUrl.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(homeUrl);
}

function handleForbidden(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

function injectUserHeaders(req: NextRequest, payload: { userId: number; role: string, department: string }) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", String(payload.userId));
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-department", payload.department);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return requestHeaders;
}

// Chiama la mutation GraphQL refreshToken al posto del vecchio endpoint REST.
// A differenza del REST, GraphQL risponde sempre con status 200 anche in caso
// di errore applicativo — l'errore va quindi controllato nel campo "errors"
// del body, non solo su refreshRes.ok.
async function refreshViaGraphQL(req: NextRequest) {
  const refreshRes = await fetch(new URL("/api/graphql", req.nextUrl.origin), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({
      query: `mutation RefreshToken { refreshToken { success } }`,
    }),
  });

  // errore di trasporto/parsing — request GraphQL malformata o server down
  if (!refreshRes.ok) return null;

  const json = await refreshRes.json();

  // errore applicativo — refresh token mancante/scaduto/non valido
  if (json.errors || !json.data?.refreshToken?.success) return null;

  return refreshRes.headers.getSetCookie();
}

// ---------------------------------------------------------------------------
// Proxy principale
// ---------------------------------------------------------------------------

export async function proxy(req: NextRequest) {
  const baseUrl = req.nextUrl.origin; // più affidabile di protocol + host
  const { pathname } = req.nextUrl;

  // guard — ignora richieste interne di Next.js senza URL valido
  if (!req.nextUrl.origin || req.nextUrl.origin === "null") {
    return NextResponse.next();
  }

  // 0. Rate limiting — solo sulle chiamate di rete verso l'API
  if (pathname.startsWith("/api")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimitResponse = checkRateLimit(ip);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // 1. Path pubblici — passa direttamente
  if (matchesPath(pathname, PUBLIC_PATHS)) {
    // se è già loggato e prova ad andare su login/register → redirect dashboard
    if (pathname === "/login" || pathname === "/register") {
      const accessToken = req.cookies.get("access_token")?.value;
      if (accessToken) {
        const payload = await verifyAccessToken(accessToken);
        if (payload) {
          return NextResponse.redirect(new URL("/dashboard", req.url), { status: 307 });
        }
      }
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("x-user-id");
    requestHeaders.delete("x-user-role");
    requestHeaders.delete("x-user-department");
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 2. Verifica o rinnova il token
  const accessToken = req.cookies.get("access_token")?.value;
  let payload = accessToken ? await verifyAccessToken(accessToken) : null;
  let setCookies: string[] = [];

  if (!payload) {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) return handleUnauthenticated(req);

    // al posto della fetch a /api/auth/refresh, chiamiamo la mutation GraphQL
    const refreshedCookies = await refreshViaGraphQL(req);
    if (!refreshedCookies) return handleUnauthenticated(req);

    setCookies = refreshedCookies;
    const newAccessToken = setCookies
      .find((c) => c.startsWith("access_token="))
      ?.split(";")[0]
      ?.split("=")[1];

    if (newAccessToken) {
      payload = await verifyAccessToken(newAccessToken);
    }

    if (!payload) return handleUnauthenticated(req);
  }

  // 3. Controlla ruolo se il path è role-protected
  const roleMatch = matchesRolePath(pathname);
  if (roleMatch && !roleMatch.roles.includes(payload.role)) {
    return handleForbidden(req);
  }

  // 4. Inietta headers e prosegui
  const requestHeaders = injectUserHeaders(req, payload);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Cache-Control", "no-store, must-revalidate");

  setCookies.forEach((cookie) => response.headers.append("Set-Cookie", cookie));

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};