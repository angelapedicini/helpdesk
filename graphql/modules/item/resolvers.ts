import prisma from "@/lib/prisma";
import { ItemInputSchema, UpdateItemSchema } from "@/lib/validators/item.schema";
import { GraphQLError } from "graphql";
import { DateResolver } from "graphql-scalars";

export const itemResolvers = {
  Date: DateResolver,
  Query: {
    items: async () => {
      return prisma.item.findMany({
        include: { user: true },
        orderBy: { id: "desc" },
      });
    },
  },
  Mutation: {
    createItem: async (_parent: unknown, args: { input: unknown }) => {
      const result = ItemInputSchema.safeParse(args.input);

      if (!result.success) {
        throw new GraphQLError("Input non valido", {
          extensions: {
            code: "BAD_USER_INPUT",
            issues: result.error.flatten(),
          },
        });
      }

      const input = result.data;

      return prisma.item.create({
        data: {
          string: input.string,
          optionalEasy: input.optionalEasy,
          numberDecimal: input.numberDecimal,
          data: input.data,
          dataOptional: input.dataOptional,
          enum: input.enum,
          user: { connect: { id: input.userId } },
        },
        include: { user: true },
      });
    },

    updateItem: async (
      _parent: unknown,
      args: { id: number; input: unknown }
    ) => {
      const result = UpdateItemSchema.safeParse(args.input);

      if (!result.success) {
        throw new GraphQLError("Input non valido", {
          extensions: {
            code: "BAD_USER_INPUT",
            issues: result.error.flatten(),
          },
        });
      }

      const input = result.data;

      const existing = await prisma.item.findUnique({
        where: { id: args.id },
      });

      if (!existing) {
        throw new GraphQLError("Elemento non trovato", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return prisma.item.update({
        where: { id: args.id },
        data: {
          ...(input.string !== undefined && { string: input.string }),
          ...(input.optionalEasy !== undefined && {
            optionalEasy: input.optionalEasy,
          }),
          ...(input.numberDecimal !== undefined && {
            numberDecimal: input.numberDecimal,
          }),
          ...(input.data !== undefined && { data: input.data }),
          ...(input.dataOptional !== undefined && {
            dataOptional: input.dataOptional,
          }),
          ...(input.enum !== undefined && { enum: input.enum }),
          ...(input.userId !== undefined && {
            user: { connect: { id: input.userId } },
          }),
        },
        include: { user: true },
      });
    },

    deleteItem: async (_parent: unknown, args: { id: number }) => {
      const existing = await prisma.item.findUnique({
        where: { id: args.id },
      });

      if (!existing) {
        throw new GraphQLError("Elemento non trovato", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return prisma.item.delete({
        where: { id: args.id },
        include: { user: true },
      });
    },
  },
};