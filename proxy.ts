import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookie-names";

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
      const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
      if (accessToken) {
        const payload = await verifyAccessToken(accessToken);
        if (payload) {
          return NextResponse.redirect(new URL("/dashboard", req.url), { status: 307 });
        }
      }
    }

    // Nessun header da gestire: l'identità viaggia nei cookie, e su una rotta
    // pubblica non serve comunque sapere chi è l'utente.
    return NextResponse.next();
  }

  // 2. Verifica o rinnova il token
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  let payload = accessToken ? await verifyAccessToken(accessToken) : null;
  let setCookies: string[] = [];
  let newAccessToken: string | undefined;

  if (!payload) {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) return handleUnauthenticated(req);

    // al posto della fetch a /api/auth/refresh, chiamiamo la mutation GraphQL
    const refreshedCookies = await refreshViaGraphQL(req);
    if (!refreshedCookies) return handleUnauthenticated(req);

    setCookies = refreshedCookies;
    newAccessToken = setCookies
      .find((c) => c.startsWith(`${ACCESS_TOKEN_COOKIE}=`))
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

  // 4. Prosegui. L'identità non viene inoltrata in un header: resta nel
  //    cookie, e chi renderizza la pagina la rilegge da lì.

  let response: NextResponse;

  // Se il token è stato rinnovato, il cookie va rimesso anche nella richiesta:
  // un proxy può scrivere un cookie solo nella risposta, quindi l'access token
  // nuovo arriverebbe al browser ma resterebbe invisibile a chi renderizza la
  // pagina in questo stesso ciclo (il layout protetto, che chiama
  // getAccessToken()). Gli altri cookie — refresh_token, demo_session_id —
  // vengono preservati.
  if (newAccessToken) {
    const cookies = req.cookies
      .getAll()
      .filter((cookie) => cookie.name !== ACCESS_TOKEN_COOKIE)
      .map((cookie) => `${cookie.name}=${cookie.value}`);

    cookies.push(`${ACCESS_TOKEN_COOKIE}=${newAccessToken}`);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("cookie", cookies.join("; "));

    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    // Access token valido: niente da correggere, la richiesta passa intatta.
    response = NextResponse.next();
  }

  response.headers.set("Cache-Control", "no-store, must-revalidate");

  setCookies.forEach((cookie) => response.headers.append("Set-Cookie", cookie));

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};