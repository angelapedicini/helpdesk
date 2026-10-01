// app/api/cron/reset/route.ts
import { runSeed } from "@/prisma/seed";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  // Blocca l'esecuzione fuori da locale: senza segreto, chiunque potrebbe chiamarla
  if (process.env.NODE_ENV === "production") {
    return new Response("Not available", { status: 403 });
  }

  try {
    await runSeed();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Reset failed", error);
    return new Response("Reset failed", { status: 500 });
  }
}