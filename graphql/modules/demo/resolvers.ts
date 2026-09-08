import { createDemoBranch } from "@/lib/neon/neon";
// import { staticPrismaClient } from "./static-client";
import { setDemoSessionCookie } from "@/lib/auth/cookies";
import { GraphQLError } from "graphql";
import { staticPrismaClient } from "@/lib/prisma/static-client";

const DEMO_TTL_MS = 60 * 60 * 1000; // 1 ora

export const demoResolvers = {
  Mutation: {
    startDemo: async () => {
      let branch;
      try {
        branch = await createDemoBranch(DEMO_TTL_MS);
      } catch (err) {
        console.error("Errore creazione branch Neon:", err);
        throw new GraphQLError("Impossibile creare l'ambiente demo. Riprova.", {
          extensions: { code: "DEMO_BRANCH_FAILED" },
        });
      }

      const demoSession = await staticPrismaClient.demoSession.create({
        data: {
          neonBranchId: branch.branchId,
          connectionString: branch.connectionString,
          expiresAt: new Date(Date.now() + DEMO_TTL_MS),
        },
      });

      // fondamentale: settiamo il cookie PRIMA del return,
      // così la chiamata a "login" che arriverà subito dopo dal client
      // lo trova già e getPrismaClient() risolve il branch giusto
      await setDemoSessionCookie(demoSession.id, DEMO_TTL_MS);

      return {
        success: true,
        demoSessionId: demoSession.id,
      };
    },
  },
};