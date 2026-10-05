// lib/apollo-client/navigation.ts
import { BASE_PATH } from "@/lib/base-path";

type Navigate = (path: string) => void;

let navigate: Navigate | null = null;

export function setNavigate(fn: Navigate) {
  navigate = fn;
}

export function redirectToDashboard() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === `${BASE_PATH}/dashboard`) return;

  if (navigate) {
    navigate("/dashboard"); // senza prefisso: lo aggiunge il router di Next
  } else {
    // fallback se il link scatta prima che Navbar sia montata
    window.location.href = `${BASE_PATH}/dashboard`;
  }
}