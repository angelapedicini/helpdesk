// modules/ticket/resolvers/mutations/create.ts
import type { GraphQLContext } from "@/graphql/context";
import { GraphQLError } from "graphql/error";
import { autoAssign } from "@/lib/ticket/autoAssign";
import { CreateTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { validateSpecificValueFormat } from "@/lib/validators/specific-value.schema";
import { computeDueDate } from "@/lib/ticket/dueDate";
import { assertCanCreateTicket } from "@/lib/casl/abilities/ticket/guards";
import { defineAbility } from "@/lib/casl/defineAbility";
import { getAllowedCategories } from "@/lib/casl/abilities/category/guards";
import { getSpecificMapping } from "@/graphql/modules/ticket/resolvers/mutations/specific-field-config";
import { buildTicketHistoryData } from "@/lib/ticket/history";
import { syncTicketNotifications } from "@/lib/ticket/notification";
import { parseOrThrow } from "@/graphql/validate";

export async function createTicket(
  _parent: unknown,
  args: { input: unknown },
  context: GraphQLContext
) {
  const session = context.requireSession();
  const ability = defineAbility(session);
  const input = parseOrThrow(CreateTicketSchema, args.input);
  const prisma = context.prisma;

  //controllo su categorie in cui user ha accesso e può creare ticket
  const category =
    input.categoryId !== undefined
      ? (await getAllowedCategories(prisma, ability)).find(
        (c) => c.id === input.categoryId
      )
      : undefined;

  if (input.categoryId !== undefined && !category) {
    throw new GraphQLError("Category not found for this user", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // La categoria scelta prevede uno specificField ma non è arrivato alcun
  // valore -> errore. Se invece category.specificField è null (categoria
  // senza campo dinamico), non c'è nulla da richiedere: si passa oltre.
  if (category?.specificField && input.specificValue == null) {
    throw new GraphQLError(
      "Missing required specificValue for category with specificField",
      { extensions: { code: "SPECIFIC_VALUE_REQUIRED" } }
    );
  }

  // Specifica mandata ma la categoria non ne prevede alcuna (o non è stata
  // scelta nessuna categoria): input non coerente, va rifiutato esplicitamente
  // invece di ignorare silenziosamente il valore.
  if (!category?.specificField && input.specificValue != null) {
    throw new GraphQLError(
      "No specifics for this category",
      { extensions: { code: "NO_SPECIFIC_VALUE" } }
    );
  }

  //qui si fa la ricerca per vedere se dove inserire i dati delle specifiche in tb corretta.
  let specificCreate: Record<string, unknown> | undefined;

  if (category?.specificField && input.specificValue != null) {
    const mapping = getSpecificMapping(category.department, category.specificField);

    if (mapping.values && !mapping.values.includes(input.specificValue)) {
      throw new GraphQLError(
        `Value not valid for ${category.specificField}`,
        { extensions: { code: "BAD_USER_INPUT" } }
      );
    }

    // Formato del riferimento per i campi testo libero (es. INVOICE_REFERENCE).
    // Messaggio inglese per lo sviluppatore; l'utente vede quello mappato
    // da "WRONG_SPECIFIC" nel notificationLink.
    if (validateSpecificValueFormat(category.specificField, input.specificValue)) {
      throw new GraphQLError(
        `Invalid format for ${category.specificField} reference`,
        { extensions: { code: "WRONG_SPECIFIC" } }
      );
    }

    specificCreate = {
      [mapping.tb]: { create: { [mapping.field]: input.specificValue } },
    };
  }

  //qui si controlla se c'è categoria si assegna un tecnico tramite funzione autoassegnazione altriemnti si lascia null in categoria e tecnico
  let assignedToId = null;
  if (input.categoryId != undefined) {
    assignedToId = await autoAssign(prisma, input.categoryId, session.userId);
  }

  const dueFirstResponse = computeDueDate(input.priority);

  //si fa transaction per ticket history e notifiche 
  const ticket = await prisma.$transaction(async (tx) => {
    const created = await tx.ticket.create({
      data: {
        title: input.title,
        description: input.description,
        status: assignedToId ? "ASSIGNED" : "OPEN",
        categoryId: input.categoryId,
        priority: input.priority,
        createdById: session.userId,
        assignedToId,
        ticketDepartment: input.department,
        sourceDepartmentForUser: session.department,
        dueFirstResponse,
        ...specificCreate,
      },
      include: { category: true, createdBy: true, assignedTo: true },
    });

    await tx.ticketHistory.create({
      data: buildTicketHistoryData(created, {
        ticketSpecific: input.specificValue ?? null,
      }),
    });

    // Notifiche leggere della campanella: NEWTICKET va all'assegnatario
    // (se il ticket nasce già assegnato) o agli admin del dipartimento
    // (se nasce OPEN, nuovo lavoro da prendere in carico).
    await syncTicketNotifications({
      tx,
      actorId: session.userId,
      before: null,
      after: created,
    });

    return created;
  });

  return ticket;
}