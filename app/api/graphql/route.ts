import type { NextRequest } from "next/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { server } from "@/graphql/server";

const handler = startServerAndCreateNextHandler(server);

export async function GET(request: NextRequest): Promise<Response> {
  return handler(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return handler(request);
}