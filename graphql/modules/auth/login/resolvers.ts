// import { getPrisma } from "@/lib/prisma/index";
// import { LoginSchema } from "@/lib/validators/auth.schema";
// import { GraphQLError } from "graphql";
// import bcrypt from "bcryptjs";
// import { buildAccessTokenPayload, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
// import { setAuthCookies } from "@/lib/auth/cookies";

// export const loginResolvers = {
//   Mutation: {
//     login: async (_parent: unknown, args: { input: unknown }) => {
//       const result = LoginSchema.safeParse(args.input);

//       if (!result.success) {
//         throw new GraphQLError("Input non valido", {
//           extensions: {
//             code: "BAD_USER_INPUT",
//             issues: result.error.flatten(),
//           },
//         });
//       }

//       const input = result.data;

//       const prisma = await getPrisma();

//       const existing = await prisma.user.findUnique({
//         where: { email: input.email },
//       });

//       const isValid =
//         existing && (await bcrypt.compare(input.password, existing.password));

//       if (!isValid) {
//         throw new GraphQLError("Password o email errati", {
//           extensions: { code: "WRONG_CREDENTIALS" },
//         });
//       }

//       const accessToken = await signAccessToken(buildAccessTokenPayload(existing));
//       const refreshToken = await signRefreshToken(existing.id);

//       // AGGIUNGI QUESTO — mancava
//       await prisma.refreshToken.create({
//         data: {
//           token: refreshToken,
//           userId: existing.id,
//           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         },
//       });

//       await setAuthCookies(accessToken, refreshToken);

//       return { success: true, user: existing };
//     },
//   },
// };

// modules/auth/login/resolvers.ts
import type { GraphQLContext } from "@/graphql/context";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import { buildAccessTokenPayload, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { clearAuthCookies, getRefreshToken, setAuthCookies } from "@/lib/auth/cookies";
import { EasyLoginSchema } from "@/lib/validators/auth.schema";

export const loginResolvers = {
  Mutation: {
    login: async (
      _parent: unknown,
      args: { input: unknown },
      context: GraphQLContext
    ) => {
      const result = EasyLoginSchema.safeParse(args.input);

      if (!result.success) {
        throw new GraphQLError("Input non valido", {
          extensions: {
            code: "BAD_USER_INPUT",
            issues: result.error.flatten(),
          },
        });
      }

      const input = result.data;

      const sharedPassword = process.env.PASSWORD;
      if (!sharedPassword) {
        throw new GraphQLError("Configurazione server mancante", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      const prisma = context.prisma;

      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });

      const isValid =
        existing && (await bcrypt.compare(sharedPassword, existing.password));

      if (!isValid) {
        throw new GraphQLError("Password o email errati", {
          extensions: { code: "WRONG_CREDENTIALS" },
        });
      }

      // Se c'è già una sessione attiva (cookie con refresh token presente),
      // la ripuliamo prima di crearne una nuova: elimina il vecchio
      // refreshToken dal DB e i cookie correnti.
      const existingRefreshToken = await getRefreshToken();
      if (existingRefreshToken) {
        await prisma.refreshToken.deleteMany({ where: { token: existingRefreshToken } });
        await clearAuthCookies();
      }

      const accessToken = await signAccessToken(buildAccessTokenPayload(existing));
      const refreshToken = await signRefreshToken(existing.id);

      // La riga muore con il token: stessa scadenza di setExpirationTime("1d")
      // in lib/auth/jwt.ts, altrimenti resterebbe viva senza più essere usabile.
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: existing.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await setAuthCookies(accessToken, refreshToken);

      return { success: true, user: existing };
    },
  },
};

