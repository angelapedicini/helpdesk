import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

// 1. Pubblici — accessibili senza token
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/graphql", // <-- il vecchio endpoint /api/auth/login, /refresh, /register erano pubblici
                  //     ora tutto passa da qui: login/register/refresh sono mutation pubbliche,
                  //     le query/mutation protette restano protette a livello di resolver
  "/docs",
  "/api/openapi",
  "/tracking",
  "/api/tracking",
];

// 3. Protetti per ruolo — richiedono token + ruolo specifico
const ROLE_PROTECTED_PATHS: { path: string; roles: string[] }[] = [
  { path: "/stats", roles: ["ADMIN"] },
  { path: "/api/admin", roles: ["ADMIN"] },
  { path: "/manager", roles: ["ADMIN", "MANAGER"] },
];

// path su cui la navbar non deve apparire
export const NAVBAR_HIDDEN_PATHS = [
  "/login",
  "/register",
  "/",
  "/tracking",
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
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function handleForbidden(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
  }
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

function injectUserHeaders(req: NextRequest, payload: { userId: number; role: string }) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", String(payload.userId));
  requestHeaders.set("x-user-role", payload.role);
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