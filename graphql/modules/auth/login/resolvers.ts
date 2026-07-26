import prisma from "@/lib/prisma";
import { LoginSchema } from "@/lib/validators/auth.schema";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";

export const loginResolvers = {
  Mutation: {
    login: async (_parent: unknown, args: { input: unknown }) => {
      const result = LoginSchema.safeParse(args.input);

      if (!result.success) {
        throw new GraphQLError("Input non valido", {
          extensions: {
            code: "BAD_USER_INPUT",
            issues: result.error.flatten(),
          },
        });
      }

      const input = result.data;

      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });

      const isValid =
        existing && (await bcrypt.compare(input.password, existing.password));

      if (!isValid) {
        throw new GraphQLError("Password o email errati", {
          extensions: { code: "WRONG_CREDENTIALS" },
        });
      }

      const accessToken = await signAccessToken({
        userId: existing.id,
        role: existing.role,  
      });
      const refreshToken = await signRefreshToken(existing.id);

      // AGGIUNGI QUESTO — mancava
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: existing.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await setAuthCookies(accessToken, refreshToken);

      return { success: true, user: existing };
    },
  },
};