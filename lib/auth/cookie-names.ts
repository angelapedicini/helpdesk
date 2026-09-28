// Nomi dei cookie in un modulo senza dipendenze, così da essere importabile
// anche dal proxy (Edge runtime), dove lib/auth/cookies.ts non può arrivare
// perché usa cookies() di next/headers, che è server-only.
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const DEMO_SESSION_COOKIE = "demo_session_id";
