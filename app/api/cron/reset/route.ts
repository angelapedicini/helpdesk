// app/api/cron/reset/route.ts
import { runSeed } from "@/prisma/seed";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await runSeed();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Reset failed", error);
    return new Response("Reset failed", { status: 500 });
  }
}