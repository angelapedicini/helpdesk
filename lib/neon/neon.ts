const NEON_API_BASE = "https://console.neon.tech/api/v2";
const PROJECT_ID = process.env.NEON_PROJECT_ID!;
const API_KEY = process.env.NEON_API_KEY!;
const PARENT_BRANCH_ID = process.env.NEON_PARENT_BRANCH_ID!;

async function neonFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${NEON_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Neon API error ${res.status} on ${path}: ${body}`);
  }

  return res.json();
}

interface CreatedBranch {
  branchId: string;
  connectionString: string;
}

// Crea un branch figlio del branch di produzione, con scadenza nativa Neon.
// La response include già connection_uris con password — non serve una
// seconda chiamata a reveal_password.
export async function createDemoBranch(ttlMs: number): Promise<CreatedBranch> {
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  const data = await neonFetch(`/projects/${PROJECT_ID}/branches`, {
    method: "POST",
    body: JSON.stringify({
      branch: {
        parent_id: PARENT_BRANCH_ID,
        name: `demo-${Date.now()}`,
        expires_at: expiresAt,
      },
      endpoints: [{ type: "read_write" }],
    }),
  });

  return {
    branchId: data.branch.id,
    connectionString: data.connection_uris[0].connection_uri,
  };
}

// Serve per il cron di pulizia più avanti — Neon elimina il branch da solo
// alla scadenza, ma può servire un delete esplicito (es. se un utente
// abbandona subito e vuoi liberare risorse prima dell'ora).
export async function deleteBranch(branchId: string): Promise<void> {
  await neonFetch(`/projects/${PROJECT_ID}/branches/${branchId}`, {
    method: "DELETE",
  });
}