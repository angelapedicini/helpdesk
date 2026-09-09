import { createDemoBranch } from "@/lib/neon/neon";
import { setDemoSessionCookie, getDemoSessionId, clearDemoSessionCookie } from "@/lib/auth/cookies";
import { GraphQLError } from "graphql";
import { staticPrismaClient } from "@/lib/prisma/static-client";

const DEMO_TTL_MS = 60 * 60 * 1000; // 1 ora

export const demoResolvers = {
  Mutation: {
    startDemo: async () => {
      // --- GUARD: c'è già una demo session attiva? ---
      const existingSessionId = await getDemoSessionId();

      if (existingSessionId) {
        const existingSession = await staticPrismaClient.demoSession.findUnique({
          where: { id: existingSessionId },
        });

        if (existingSession && existingSession.expiresAt > new Date()) {
          // Sessione ancora valida: non creiamo un nuovo branch,
          // semplicemente confermiamo quella esistente.
          return {
            success: true,
            demoSessionId: existingSession.id,
          };
        }

        // Cookie presente ma sessione scaduta/inesistente in DB:
        // puliamo il cookie stantio e procediamo a crearne una nuova.
        await clearDemoSessionCookie();
      }

      // --- Creazione normale della demo ---
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