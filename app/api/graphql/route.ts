import type { NextRequest } from "next/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { server } from "@/graphql/server";
import { createContext, type GraphQLContext } from "@/graphql/context";

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: createContext,
});

export async function GET(request: NextRequest): Promise<Response> {
  return handler(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return handler(request);
}
