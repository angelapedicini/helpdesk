import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { getDemoSessionId } from "../auth/cookies";

const globalForPrisma = globalThis as unknown as {
  prodPrisma?: PrismaClient;
  demoPrismaCache?: Map<string, { client: PrismaClient; lastUsed: number }>;
};

// --- client di produzione ---
const prodAdapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prodPrisma = globalForPrisma.prodPrisma ?? new PrismaClient({ adapter: prodAdapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prodPrisma = prodPrisma;

// --- cache client demo ---
const demoCache = globalForPrisma.demoPrismaCache ?? new Map();
if (process.env.NODE_ENV !== "production") globalForPrisma.demoPrismaCache = demoCache;

const MAX_DEMO_CLIENTS = 20;

async function getDemoPrismaClient(connectionString: string): Promise<PrismaClient> {
  const cached = demoCache.get(connectionString);
  if (cached) {
    cached.lastUsed = Date.now();
    return cached.client;
  }

  if (demoCache.size >= MAX_DEMO_CLIENTS) {
    const oldest = [...demoCache.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
    if (oldest) {
      await oldest[1].client.$disconnect();
      demoCache.delete(oldest[0]);
    }
  }

  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });
  demoCache.set(connectionString, { client, lastUsed: Date.now() });
  return client;
}

async function resolveDemoConnectionString(): Promise<string | undefined> {
  const demoSessionId = await getDemoSessionId();
  if (!demoSessionId) return undefined;

  const session = await prodPrisma.demoSession.findUnique({
    where: { id: demoSessionId },
  });

  if (!session || session.expiresAt < new Date()) return undefined;

  return session.connectionString;
}

export async function getPrismaClient(): Promise<PrismaClient> {
  const demoConnectionString = await resolveDemoConnectionString();
  if (!demoConnectionString) return prodPrisma;
  return getDemoPrismaClient(demoConnectionString);
}