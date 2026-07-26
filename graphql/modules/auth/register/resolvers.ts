import prisma from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validators/auth.schema";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const registerResolvers = {
  Mutation: {
    createUser: async (_parent: unknown, args: { input: unknown }) => {
      const result = RegisterSchema.safeParse(args.input);

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

      if (existing) {
        throw new GraphQLError("Email già registrata", {
          extensions: { code: "EMAIL_ALREADY_EXISTS" },
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

      return prisma.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          password: hashedPassword,
          role: "EMPLOYEE",
          department: input.department, 
        },
      });
    },
  },
};