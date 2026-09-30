import { GraphQLError } from "graphql";
import { getAccessToken } from "@/lib/auth/cookies";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/auth/jwt";
import { getPrisma } from "@/lib/prisma/index";
import type { PrismaClient } from "@/app/generated/prisma/client";

// /api/graphql è in PUBLIC_PATHS: proxy.ts non inietta gli header x-user-*
// su questa rotta, quindi l'unica fonte della sessione è il cookie.
export type GraphQLContext = {
  session: AccessTokenPayload | null;
  requireSession: () => AccessTokenPayload;
  /**
   * Il client Prisma di questa richiesta, già instradato sul branch corretto.
   *
   * Si risolve una volta per richiesta e non per resolver, per due motivi:
   * la lookup del branch demo non viene ripetuta, e soprattutto tutti i
   * resolver della stessa query parlano con lo stesso client. Senza questa
   * garanzia, se il cache LRU dei client demo sfrattasse il client fra un
   * resolver e l'altro, i due potrebbero leggere da database diversi.
   *
   * Fuori da GraphQL (route handler, server component, script) il client si
   * prende ancora con getPrisma().
   */
  prisma: PrismaClient;
};

export async function createContext(): Promise<GraphQLContext> {
  const token = await getAccessToken();
  const session = token ? await verifyAccessToken(token) : null;

  // Costa una lettura di cookie, non una query: resolveDemoConnectionString
  // interroga DemoSession solo quando il cookie demo è presente.
  const prisma = await getPrisma();

  return {
    session,
    prisma,
    requireSession() {
      if (!session) {
        throw new GraphQLError("Non autorizzato", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      return session;
    },
  };
}
