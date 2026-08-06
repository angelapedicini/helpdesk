import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { paginateByCursor } from "@/graphql/pagination/pagination";
import type { Prisma } from "@/app/generated/prisma/client";
import { SortArg, toPrismaOrderBy } from "@/graphql/sorting/sorting";
import { GraphQLError } from "graphql/error";
import {
  TicketCreateSchema,
  TicketUpdateSchema,
  TicketFilterSchema,
} from "@/lib/validators/ticket.schema";
import { defineAbilityFor, ALLOWED_STATUS_TRANSITIONS } from "@/lib/casl/abilities";
import { ForbiddenError, subject } from "@casl/ability";
import { accessibleBy } from "@casl/prisma";
import { AccessTokenPayload } from "@/lib/auth/jwt";
import { autoAssign } from "@/lib/ticket/autoAssign";

type TicketSortField =
  | "ID"
  | "TITLE"
  | "DESCRIPTION"
  | "STATUS"
  | "PRIORITY"
  | "CATEGORY"
  | "DEPARTMENT"
  | "CREATED_BY"
  | "ASSIGNED_TO"
  | "CREATED_AT"
  | "UPDATED_AT"
  | "CLOSED_AT";

const TICKET_SORT_FIELD_MAP: Record<TicketSortField, string> = {
  ID: "id",
  TITLE: "title",
  DESCRIPTION: "description",
  STATUS: "status",
  PRIORITY: "priority",
  CATEGORY: "category.name",
  DEPARTMENT: "category.department",
  CREATED_BY: "createdBy.firstName",
  ASSIGNED_TO: "assignedTo.firstName",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  CLOSED_AT: "closedAt",
};

type TicketScope = "MINE" | "ASSIGNED_TO_ME" | "DEPARTMENT";

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

function buildScopeWhere(
  scope: TicketScope,
  session: AccessTokenPayload
): Prisma.TicketWhereInput {
  switch (scope) {
    case "MINE":
      // disponibile a tutti i ruoli
      return { createdById: session.userId };

    case "ASSIGNED_TO_ME":
      if (session.role !== "TECHNICIAN") {
        throw new GraphQLError("Vista non disponibile per il tuo ruolo", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return { assignedToId: session.userId };

    case "DEPARTMENT":
      if (session.role !== "ADMIN") {
        throw new GraphQLError("Vista non disponibile per il tuo ruolo", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return { sourceDepartmentForUser: session.department };

    default: {
      const _exhaustive: never = scope;
      throw new GraphQLError("Scope non valido", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
  }
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
        scope?: TicketScope;
      }
    ) => {
      const session = await requireSession();
      const ability = defineAbilityFor(session);

      const orderBy = toPrismaOrderBy<TicketSortField, Prisma.TicketOrderByWithRelationInput>(
        args.orderBy,
        TICKET_SORT_FIELD_MAP,
        { id: "desc" }
      );

      const scope: TicketScope = args.scope ?? "MINE";

      const where: Prisma.TicketWhereInput = {
        deletedAt: null,
        AND: [
          accessibleBy(ability, "read").ofType("Ticket"), // tetto di sicurezza CASL
          buildScopeWhere(scope, session),                 // quale vista (MINE / ASSIGNED_TO_ME / DEPARTMENT)
          buildTicketWhere(args.filter),                    // filtri opzionali (status, categoria...)
        ],
      };

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

  Mutation: {
    createTicket: async (_parent: unknown, args: { input: unknown }) => {
      const session = await requireSession();
      const ability = defineAbilityFor(session);

      console.log("session:", session);

      ForbiddenError.from(ability).throwUnlessCan("create", "Ticket");

      const result = TicketCreateSchema.safeParse(args.input);
      if (!result.success) {
        throw new GraphQLError("Input non valido", {
          extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
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

      // if (input.assignedToId) {
      //   const assignee = await prisma.user.findUnique({
      //     where: { id: input.assignedToId },
      //   });
      //   if (!assignee) {
      //     throw new GraphQLError("Utente assegnatario non trovato", {
      //       extensions: { code: "NOT_FOUND" },
      //     });
      //   }
      // }

      if (input.categoryId == null) {

      }

      const assignedToId = await autoAssign(input.categoryId);

      //////////////////cambiare qui
      return prisma.ticket.create({
        data: {
          title: input.title,
          description: input.description,
          status: assignedToId ? "ASSIGNED" : "OPEN",
          sourceDepartmentForUser: session.department,
          categoryId: input.categoryId,      
          createdById: session.userId,       
          assignedToId: assignedToId,
          ticketDepartment: input.department        
        },
        include: { category: true, createdBy: true, assignedTo: true },
      });
    },

    updateTicket: async (_parent: unknown, args: { id: number; input: unknown }) => {
      const session = await requireSession();
      const ability = defineAbilityFor(session);

      const result = TicketUpdateSchema.safeParse(args.input);
      if (!result.success) {
        throw new GraphQLError("Input non valido", {
          extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
        });
      }
      const input = result.data;

      const existing = await prisma.ticket.findUnique({ where: { id: args.id } });
      if (!existing || existing.deletedAt) {
        throw new GraphQLError("Ticket non trovato", { extensions: { code: "NOT_FOUND" } });
      }

      // controlla solo i campi effettivamente inviati (undefined = campo non toccato)
      const fieldsToCheck = (Object.keys(input) as (keyof typeof input)[]).filter(
        (field) => input[field] !== undefined
      );

      if (fieldsToCheck.length === 0) {
        throw new GraphQLError("Nessun campo da aggiornare", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const ticketSubject = subject("Ticket", existing);
      for (const field of fieldsToCheck) {
        if (ability.cannot("update", ticketSubject, field)) {
          throw new GraphQLError(`Non hai i permessi per modificare "${field}"`, {
            extensions: { code: "FORBIDDEN" },
          });
        }
      }

      // validazione della transizione di stato (CASL autorizza il campo, non il valore)
      if (input.status !== undefined) {
        const allowed = ALLOWED_STATUS_TRANSITIONS[session.role]?.[existing.status] ?? [];
        if (!allowed.includes(input.status)) {
          throw new GraphQLError(
            `Transizione di stato non valida: ${existing.status} → ${input.status}`,
            { extensions: { code: "BAD_USER_INPUT" } }
          );
        }

        // rifiuto: richiede sempre una motivazione (va inserita come messaggio
        // dal chiamante, qui verifichiamo solo che sia presente nell'input,
        // adatta al tuo schema se il messaggio è una mutation separata)
      }

      if (input.categoryId !== undefined) {
        const category = await prisma.ticketCategory.findUnique({
          where: { id: input.categoryId },
        });
        if (!category) {
          throw new GraphQLError("Categoria non trovata", {
            extensions: { code: "NOT_FOUND" },
          });
        }
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

      const data: Prisma.TicketUpdateInput = {};
      if (input.title !== undefined) data.title = input.title;
      if (input.description !== undefined) data.description = input.description;
      if (input.categoryId !== undefined) {
        data.category = { connect: { id: input.categoryId } };
      }
      if (input.assignedToId !== undefined) {
        data.assignedTo =
          input.assignedToId !== null
            ? { connect: { id: input.assignedToId } }
            : { disconnect: true };
      }
      if (input.status !== undefined) data.status = input.status;
      if (input.dueDate !== undefined) data.dueDate = input.dueDate;
      if (input.status === "CLOSED") data.closedAt = new Date();

      return prisma.ticket.update({
        where: { id: args.id },
        data,
        include: { category: true, createdBy: true, assignedTo: true },
      });
    },

    deleteTicket: async (_parent: unknown, args: { id: number }) => {
      const session = await requireSession();

      const existing = await prisma.ticket.findUnique({ where: { id: args.id } });
      if (!existing || existing.deletedAt) {
        throw new GraphQLError("Ticket non trovato", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (existing.createdById !== session.userId) {
        throw new GraphQLError("Non puoi eliminare un ticket che non hai creato", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      if (existing.status !== "OPEN") {
        throw new GraphQLError(
          "Non è possibile eliminare un ticket già preso in carico",
          { extensions: { code: "BAD_USER_INPUT" } }
        );
      }

      return prisma.ticket.update({
        where: { id: args.id },
        data: { deletedAt: new Date() },
        include: { category: true, createdBy: true, assignedTo: true },
      });
    },
  },
};