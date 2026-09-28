import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  DEMO_SESSION_COOKIE,
} from "@/lib/auth/cookie-names";

//funzione che setta i cookie di access e refresh token, con le opzioni httpOnly, secure, sameSite, path e maxAge
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 61, // 1h 1m minuti
  });

  //mette dentro cookie store il refresh token con le stesse opzioni ma maxAge di 7 giorni
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 giorni
  });
}

//funzione che cancella i cookie di access e refresh token
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
// Legge il valore del cookie access_token.
// Usata dal context GraphQL e dal layout protetto per verificare il token nei Server Component e route handler.
// Il frontend non può accedere a questi cookie — sono HttpOnly.
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

// Legge il valore del cookie refresh_token.
// Usata dal context GraphQL e dal layout protetto per verificare il token nei Server Component e route handler.
// Il frontend non può accedere a questi cookie — sono HttpOnly.
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}


// Setta il cookie che identifica la sessione demo attiva.
// Usato da startDemo per instradare le query successive (via getPrismaClient)
// verso il branch Neon corretto invece che verso produzione.
export async function setDemoSessionCookie(demoSessionId: string, maxAgeMs: number) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE, demoSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  });
}

// Legge il cookie demo, usato da lib/prisma.ts per il lookup su DemoSession.
export async function getDemoSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_SESSION_COOKIE)?.value ?? null;
}

export async function clearDemoSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);
}