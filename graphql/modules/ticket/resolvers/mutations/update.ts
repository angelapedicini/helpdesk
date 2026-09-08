// modules/ticket/resolvers/mutations/update.ts
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { UpdateTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { computeDueDate } from "@/lib/ticket/dueDate";
import { autoAssign } from "@/lib/ticket/autoAssign";
import { assertCanUpdateTicket } from "@/lib/casl/abilities/ticket/guards";
import { defineAbilityForTicket } from "@/lib/casl/abilities/ticket/rules";
import { getAllowedCategories } from "@/lib/casl/abilities/category/guards";
import { getSpecificMapping, getFieldsForTable } from "./specific-field-config";

export async function updateTicket(_parent: unknown, args: { id: number; input: unknown }) {
  const session = await requireSession();
  const ability = defineAbilityForTicket(session);

  const result = UpdateTicketSchema.safeParse(args.input);
  if (!result.success) {
    throw new GraphQLError("Invalid input", {
      extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
    });
  }
  const input = result.data;

  const existing = await prisma.ticket.findUnique({
    where: { id: args.id },
    include: {
      category: true,
      createdBy: true,
      assignedTo: true,
      lastUpdatedBy: true,
      itSpecific: true,
      hrSpecific: true,
      financeSpecific: true,
      supportSpecific: true,
      logisticSpecific: true,
    },
  });

  if (!existing) {
    throw new GraphQLError("Ticket not found", { extensions: { code: "NOT_FOUND" } });
  }

  // Permessi CASL campo per campo + transizioni di stato: va fatto PRIMA di
  // qualsiasi calcolo su categoria/specifica, così un utente senza i permessi
  // giusti si ferma qui senza che il resolver faccia lavoro inutile.
  assertCanUpdateTicket(ability, session, existing, input);

  // targetCategory rappresenta la categoria "di destinazione" dopo l'update:
  // - input.categoryId === undefined -> la categoria non cambia, resta quella esistente
  // - input.categoryId === null      -> il ticket viene portato a "nessuna categoria"
  // - input.categoryId === <id>      -> nuova categoria, va validata come consentita per l'utente
  let targetCategory: Awaited<ReturnType<typeof getAllowedCategories>>[number] | null = existing.category;

  if (input.categoryId !== undefined) {
    if (input.categoryId === null) {
      targetCategory = null;
    } else {
      const allowedCategories = await getAllowedCategories(prisma, {
        department: session.department,
        role: session.role,
      });

      const found = allowedCategories.find((c) => c.id === input.categoryId);
      if (!found) {
        throw new GraphQLError("Category not found for this user", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      targetCategory = found;
    }
  }

  if (input.assignedToId !== undefined && input.assignedToId !== null) {
    const assignee = await prisma.user.findUnique({ where: { id: input.assignedToId } });
    if (!assignee) {
      throw new GraphQLError("User for assigned to not found", { extensions: { code: "ASSIGNED_TO_ERROR" } });
    }
  }

  let closedAt: Date | undefined = undefined;
  let dueDate: Date | undefined = undefined;

  if (input.status === "CLOSED") {
    closedAt = new Date();
  }

  if (input.priority !== undefined && input.priority !== existing.priority && input.dueDate === undefined) {
    dueDate = computeDueDate(input.priority);
  }

  if (input.dueDate !== undefined) {
    dueDate = input.dueDate;
  }

  const categoryId = input.categoryId !== undefined ? input.categoryId : existing.categoryId;

  if (input.assignedToId !== undefined && input.assignedToId !== null && categoryId !== null) {
    const specialization = await prisma.userSpecialization.findUnique({
      where: {
        userId_categoryId: {
          userId: input.assignedToId,
          categoryId,
        },
      },
    });

    if (!specialization) {
      throw new GraphQLError(
        "The assigned to user selected doesn't have the correct specialization for this ticket",
        { extensions: { code: "ASSIGNED_TO_ERROR" } }
      );
    }
  }

  let status = input.status;

  if (
    input.assignedToId !== undefined &&
    input.assignedToId !== null &&
    existing.status === "OPEN"
  ) {
    status = "ASSIGNED";
  }

  let assignedToId = input.assignedToId;

  if (input.categoryId !== undefined && input.categoryId !== null && input.assignedToId === undefined) {
    assignedToId = await autoAssign(input.categoryId, existing.createdById);
    status = "ASSIGNED";
  }

  // closingMessage arriva già validato come obbligatorio quando status è
  // CLOSED/REFUSED (vedi superRefine nello schema). Lo salvo sia sul Ticket
  // (cache per lettura rapida) sia come TicketMessage dedicato.
  const isClosingTransition = status === "CLOSED" || status === "REFUSED";
  const closingMessage = isClosingTransition ? input.closingMessage : undefined;

  // ================= Gestione specifica dinamica =================
  //
  // A differenza della versione precedente, la categoria PUÒ cambiare in
  // update. Quindi la specifica non segue più "sempre la categoria attuale
  // del ticket": va ricalcolata sulla categoria di destinazione (targetCategory).
  //
  // oldMapping = come viene letta/scritta la specifica sulla categoria ATTUALE
  // newMapping = come viene letta/scritta la specifica sulla categoria DI DESTINAZIONE
  const oldMapping = existing.category?.specificField
    ? getSpecificMapping(existing.category.department, existing.category.specificField)
    : null;

  const newMapping = targetCategory?.specificField
    ? getSpecificMapping(targetCategory.department, targetCategory.specificField)
    : null;

  const categoryChanged =
    input.categoryId !== undefined && input.categoryId !== existing.categoryId;

  // --- Validazioni di dominio ---
  // (Zod dovrebbe già bloccare la maggior parte di questi casi a monte via
  // superRefine, ma li ricontrolliamo qui come difesa in profondità, perché
  // qui abbiamo accesso ai dati reali di categoria/dipartimento dal DB.)

  // 1. Cambio categoria verso una categoria che richiede una specifica,
  //    ma la specifica non è stata mandata nello stesso payload.
  if (categoryChanged && newMapping && input.specificValue == null) {
    throw new GraphQLError(
      `The selected category requires to specify the correct specific, "${newMapping.field}"`,
      { extensions: { code: "SPECIFIC_VALUE_REQUIRED" } }
    );
  }

  // 2. Specifica mandata ma la categoria di destinazione non ne prevede nessuna
  //    (categoria senza specificField, o categoryId portato a null).
  if (!newMapping && input.specificValue != null) {
    throw new GraphQLError(
      "The category doesn't have or requires any specific value",
      { extensions: { code: "NO_SPECIFIC_VALUE" } }
    );
  }

  // 3. Valore fuori dall'enum ammesso per il campo specifico di destinazione.
  if (
    newMapping &&
    input.specificValue != null &&
    newMapping.values &&
    !newMapping.values.includes(input.specificValue)
  ) {
    throw new GraphQLError(
      `This value is not valid for this category, ${newMapping.field}`,
      { extensions: { code: "WRONG_SPECIFIC" } }
    );
  }

  // --- Valore "vecchio", per lo snapshot dello storico ---
  // Letto dalla riga già inclusa in existing, sulla mappatura VECCHIA.
  const oldSpecificValue: string | null = oldMapping
    ? ((existing[oldMapping.tb] as Record<string, unknown> | null)?.[oldMapping.field] as string ?? null)
    : null;

  // --- Costruzione della nested write Prisma ---
  // specificUpdate accumula le chiavi da passare dentro ticket.update({ data: ... }).
  // Può contenere sia la tabella vecchia (per il delete) sia quella nuova
  // (per l'upsert), se sono tabelle diverse.
  let specificUpdate: Record<string, unknown> = {};

  const oldRowExists = oldMapping ? existing[oldMapping.tb] != null : false;
  const tableChanged = oldMapping && newMapping ? oldMapping.tb !== newMapping.tb : oldMapping?.tb !== newMapping?.tb;

  // Vecchia riga da eliminare quando: la nuova categoria non usa più la stessa
  // tabella (o non usa nessuna tabella), e la riga vecchia esisteva davvero.
  // Storico già coperto da ticketHistory, quindi qui è un delete pieno, non un soft-delete.
  if (oldMapping && oldRowExists && tableChanged) {
    specificUpdate[oldMapping.tb] = { delete: true };
  }

  // Nuova riga da creare/aggiornare quando arriva un valore.
  // clearedFields azzera tutti gli altri campi noti della stessa tabella
  // (es. hardwareType/software su itSpecific), per non lasciare residui se
  // il campo specifico cambia restando nella stessa tabella/dipartimento
  // (es. categoria IT che passa da HARDWARE_TYPE a SOFTWARE).
  if (newMapping && input.specificValue != null) {
    const clearedFields = Object.fromEntries(
      getFieldsForTable(newMapping.tb)
        .filter((field) => field !== newMapping.field)
        .map((field) => [field, null])
    );

    specificUpdate[newMapping.tb] = {
      upsert: {
        create: { [newMapping.field]: input.specificValue },
        update: { ...clearedFields, [newMapping.field]: input.specificValue },
      },
    };
  }

  // Transazione interattiva: lo snapshot fotografa lo stato DOPO l'update
  // (coerente con lo snapshot "di nascita" in create.ts), quindi serve il
  // risultato di ticket.update prima di poterlo costruire.
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.ticket.update({
      where: { id: args.id },
      data: {
        title: input.title,
        description: input.description,
        status: status,
        priority: input.priority,
        categoryId: input.categoryId,
        assignedToId: assignedToId,
        closedAt,
        dueDate,
        lastUpdatedById: session.userId,
        closingMessage,
        ...specificUpdate,
      },
      include: {
        category: true,
        createdBy: true,
        assignedTo: true,
        lastUpdatedBy: true,
        itSpecific: true,
        hrSpecific: true,
        financeSpecific: true,
        supportSpecific: true,
        logisticSpecific: true,
      },
    });

    if (isClosingTransition) {
      await tx.ticketMessage.create({
        data: {
          ticketId: args.id,
          authorId: session.userId,
          content: closingMessage!,
          isClosingMessage: true,
        },
      });
    }

    await tx.ticketHistory.create({
      data: {
        originalTicketId: args.id,

        title: result.title,
        description: result.description,
        status: result.status,
        priority: result.priority,

        categoryId: result.categoryId,
        createdById: result.createdById,
        assignedToId: result.assignedToId,
        lastUpdatedById: result.lastUpdatedById,

        closingMessage: result.closingMessage,

        sourceDepartmentForUser: result.sourceDepartmentForUser,
        ticketDepartment: result.ticketDepartment,

        ticketSpecific: input.specificValue != null ? input.specificValue : oldSpecificValue,

        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        dueDate: result.dueDate,
        closedAt: result.closedAt,
      },
    });

    return result;
  });

  return updated;
}