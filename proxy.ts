import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookie-names";

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, nessuna dipendenza esterna)
// Nota: su Vercel ogni istanza ha la sua mappa, quindi è solo best-effort.
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 150;
const BAN_DURATION_MS = 5 * 60_000; // 5 minuti

type RateLimitEntry = { count: number; windowStart: number };

const requestCounts = new Map<string, RateLimitEntry>();
const bannedIps = new Map<string, number>(); // ip -> timestamp di scadenza ban

function checkRateLimit(ip: string): NextResponse | null {
  const now = Date.now();

  const banExpiry = bannedIps.get(ip);
  if (banExpiry) {
    if (now < banExpiry) {
      return NextResponse.json(
        { error: "Troppe richieste. Riprova tra qualche minuto." },
        { status: 429 }
      );
    }
    bannedIps.delete(ip);
  }

  const entry = requestCounts.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
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

// Pubblici: accessibili senza cookie. /api/graphql resta pubblico perché
// login/register/refresh sono mutation pubbliche; le altre sono protette
// nei resolver tramite requireSession().
const PUBLIC_PATHS = ["/", "/api/graphql"];

// Protetti per ruolo (controllo ottimistico, vedi sotto)
const ROLE_PROTECTED_PATHS: { path: string; roles: string[] }[] = [
  { path: "/stats", roles: ["ADMIN", "SYSTEM_ADMIN"] },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function appUrl(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone(); // mantiene il basePath
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost) {
    url.host = forwardedHost;
    url.protocol = req.headers.get("x-forwarded-proto") ?? url.protocol;
  }
  url.pathname = pathname;
  url.search = "";
  return url;
}

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
  const homeUrl = appUrl(req, "/");
  homeUrl.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(homeUrl);
}

function handleForbidden(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  return NextResponse.redirect(appUrl(req, "/dashboard"));
}

// ---------------------------------------------------------------------------
// Proxy principale: controllo OTTIMISTICO
//
// Non rinnova mai il token e non decide in base alla scadenza dell'access
// token. Serve solo a evitare di renderizzare pagine protette a chi non ha
// proprio nessuna sessione. L'autorizzazione vera resta nei resolver GraphQL
// (createContext + requireSession), e il rinnovo del token nel client Apollo.
// ---------------------------------------------------------------------------

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // guard: richieste interne di Next.js senza URL valido
  if (!req.nextUrl.origin || req.nextUrl.origin === "null") {
    return NextResponse.next();
  }

  // 0. Rate limiting solo sulle API
  if (pathname.startsWith("/api")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimitResponse = checkRateLimit(ip);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // 1. Path pubblici: passa direttamente
  if (matchesPath(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  // 2. Controllo ottimistico: basta che esista almeno un cookie di sessione.
  //    Un access token scaduto NON è un motivo di redirect: se c'è il refresh
  //    token, il client rinnoverà alla prima chiamata GraphQL.
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return handleUnauthenticated(req);
  }

  // 3. Ruolo, best-effort: se l'access token è valido e il ruolo non basta,
  //    blocca subito. Se è scaduto, lascia passare: il controllo definitivo
  //    va fatto lato server (layout/pagina/resolver), dove il token è verificato.
  const roleMatch = matchesRolePath(pathname);
  if (roleMatch && accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload && !roleMatch.roles.includes(payload.role)) {
      return handleForbidden(req);
    }
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};