import { GraphQLError } from "graphql";
import { getAccessToken } from "@/lib/auth/cookies";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/auth/jwt";

// /api/graphql è in PUBLIC_PATHS: proxy.ts non inietta gli header x-user-*
// su questa rotta, quindi l'unica fonte della sessione è il cookie.
export type GraphQLContext = {
  session: AccessTokenPayload | null;
  requireSession: () => AccessTokenPayload;
};

export async function createContext(): Promise<GraphQLContext> {
  const token = await getAccessToken();
  const session = token ? await verifyAccessToken(token) : null;

  return {
    session,
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
