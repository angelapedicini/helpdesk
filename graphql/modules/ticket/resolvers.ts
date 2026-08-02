// // modules/ticket/resolvers.ts
// import prisma from "@/lib/prisma";
// import { requireSession } from "@/lib/auth/session";
// import { paginateByCursor } from "@/graphql/pagination/pagination";
// import type { Prisma } from "@/app/generated/prisma/client";
// import { SortArg, toPrismaOrderBy } from "@/graphql/sorting/sorting";
// import { GraphQLError } from "graphql/error";
// import { TicketInputSchema } from "@/lib/validators/ticket.schema";


// type TicketSortField =
//   | "ID"
//   | "TITLE"
//   | "DESCRIPTION"
//   | "STATUS"
//   | "CATEGORY"
//   | "DEPARTMENT"
//   | "CREATED_BY"
//   | "ASSIGNED_TO"
//   | "CREATED_AT"
//   | "UPDATED_AT"
//   | "CLOSED_AT";

// const TICKET_SORT_FIELD_MAP: Record<TicketSortField, string> = {
//   ID: "id",
//   TITLE: "title",
//   DESCRIPTION: "description",
//   STATUS: "status",
//   CATEGORY: "category.name",
//   DEPARTMENT: "category.department",
//   CREATED_BY: "createdBy.firstName",
//   ASSIGNED_TO: "assignedTo.firstName",
//   CREATED_AT: "createdAt",
//   UPDATED_AT: "updatedAt",
//   CLOSED_AT: "closedAt",
// };

// export const ticketResolvers = {
//   Query: {
//     tickets: async (
//       _parent: unknown,
//       args: { first?: number; after?: string; orderBy?: SortArg<TicketSortField> }
//     ) => {
//       await requireSession();

//       const orderBy = toPrismaOrderBy<TicketSortField, Prisma.TicketOrderByWithRelationInput>(
//         args.orderBy,
//         TICKET_SORT_FIELD_MAP,
//         { id: "desc" }
//       );

//       return paginateByCursor(args, {
//         fetchPage: ({ take, skip, cursor }) =>
//           prisma.ticket.findMany({
//             take,
//             skip,
//             cursor,
//             include: { category: true, createdBy: true, assignedTo: true },
//             orderBy,
//           }),
//       });
//     },
//   },
//   // modules/ticket/resolvers.ts (mutation aggiunta)
//   Mutation: {
//     createTicket: async (_parent: unknown, args: { input: unknown }) => {
//       const session = await requireSession();

//       const result = TicketInputSchema.safeParse(args.input);
//       if (!result.success) {
//         throw new GraphQLError("Input non valido", {
//           extensions: {
//             code: "BAD_USER_INPUT",
//             issues: result.error.flatten(),
//           },
//         });
//       }
//       const input = result.data;

//       const category = await prisma.ticketCategory.findUnique({
//         where: { id: input.categoryId },
//       });
//       if (!category) {
//         throw new GraphQLError("Categoria non trovata", {
//           extensions: { code: "NOT_FOUND" },
//         });
//       }

//       if (input.assignedToId) {
//         const assignee = await prisma.user.findUnique({
//           where: { id: input.assignedToId },
//         });
//         if (!assignee) {
//           throw new GraphQLError("Utente assegnatario non trovato", {
//             extensions: { code: "NOT_FOUND" },
//           });
//         }
//       }

//       return prisma.ticket.create({
//         data: {
//           title: input.title,
//           description: input.description,
//           status: "OPEN",
//           category: { connect: { id: input.categoryId } },
//           createdBy: { connect: { id: session.userId } }, 
//           ...(input.assignedToId && {
//             assignedTo: { connect: { id: input.assignedToId } },
//           }),
//         },
//         include: { category: true, createdBy: true, assignedTo: true },
//       });
//     },
//   },
// };

// modules/ticket/resolvers.ts
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { paginateByCursor } from "@/graphql/pagination/pagination";
import type { Prisma } from "@/app/generated/prisma/client";
import { SortArg, toPrismaOrderBy } from "@/graphql/sorting/sorting";
import { GraphQLError } from "graphql/error";
import { TicketInputSchema, TicketFilterSchema } from "@/lib/validators/ticket.schema";

type TicketSortField =
  | "ID" | "TITLE" | "DESCRIPTION" | "STATUS" | "CATEGORY"
  | "DEPARTMENT" | "CREATED_BY" | "ASSIGNED_TO"
  | "CREATED_AT" | "UPDATED_AT" | "CLOSED_AT";

const TICKET_SORT_FIELD_MAP: Record<TicketSortField, string> = {
  ID: "id",
  TITLE: "title",
  DESCRIPTION: "description",
  STATUS: "status",
  CATEGORY: "category.name",
  DEPARTMENT: "category.department",
  CREATED_BY: "createdBy.firstName",
  ASSIGNED_TO: "assignedTo.firstName",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  CLOSED_AT: "closedAt",
};

function buildTicketWhere(rawFilter: unknown): Prisma.TicketWhereInput {
  if (!rawFilter) return {};

  const result = TicketFilterSchema.safeParse(rawFilter);
  if (!result.success) {
    throw new GraphQLError("Filtro non valido", {
      extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
    });
  }
  const filter = result.data;

  return {
    ...(filter.createdById && { createdById: filter.createdById }),
    ...(filter.assignedToId && { assignedToId: filter.assignedToId }),
    ...(filter.status && { status: filter.status }),
    ...(filter.categoryId && { categoryId: filter.categoryId }),
  };
}

export const ticketResolvers = {
  Query: {
    tickets: async (
      _parent: unknown,
      args: {
        first?: number;
        after?: string;
        orderBy?: SortArg<TicketSortField>;
        filter?: unknown;
      }
    ) => {
      await requireSession();

      const orderBy = toPrismaOrderBy<TicketSortField, Prisma.TicketOrderByWithRelationInput>(
        args.orderBy,
        TICKET_SORT_FIELD_MAP,
        { id: "desc" }
      );

      const where = buildTicketWhere(args.filter);

      return paginateByCursor(args, {
        fetchPage: ({ take, skip, cursor }) =>
          prisma.ticket.findMany({
            take,
            skip,
            cursor,
            where,
            include: { category: true, createdBy: true, assignedTo: true },
            orderBy,
          }),
      });
    },
  },
  //   // modules/ticket/resolvers.ts (mutation aggiunta)
  Mutation: {
    createTicket: async (_parent: unknown, args: { input: unknown }) => {
      const session = await requireSession();

      const result = TicketInputSchema.safeParse(args.input);
      if (!result.success) {
        throw new GraphQLError("Input non valido", {
          extensions: {
            code: "BAD_USER_INPUT",
            issues: result.error.flatten(),
          },
        });
      }
      const input = result.data;

      const category = await prisma.ticketCategory.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new GraphQLError("Categoria non trovata", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (input.assignedToId) {
        const assignee = await prisma.user.findUnique({
          where: { id: input.assignedToId },
        });
        if (!assignee) {
          throw new GraphQLError("Utente assegnatario non trovato", {
            extensions: { code: "NOT_FOUND" },
          });
        }
      }

      return prisma.ticket.create({
        data: {
          title: input.title,
          description: input.description,
          status: "OPEN",
          category: { connect: { id: input.categoryId } },
          createdBy: { connect: { id: session.userId } },
          ...(input.assignedToId && {
            assignedTo: { connect: { id: input.assignedToId } },
          }),
        },
        include: { category: true, createdBy: true, assignedTo: true },
      });
    },
  },
};