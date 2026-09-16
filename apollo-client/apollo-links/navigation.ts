// lib/apollo-client/navigation.ts

type Navigate = (path: string) => void;

let navigate: Navigate | null = null;

export function setNavigate(fn: Navigate) {
  navigate = fn;
}

export function redirectToDashboard() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/dashboard") return;

  if (navigate) {
    navigate("/dashboard");
  } else {
    // fallback se il link scatta prima che Navbar sia montata
    window.location.href = "/dashboard";
  }
}