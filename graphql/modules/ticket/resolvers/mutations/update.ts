// modules/ticket/resolvers/mutations/update.ts
import { getPrisma } from "@/lib/prisma/index";
import { buildTicketHistoryData } from "@/lib/ticket/history";
import { requireSession } from "@/lib/auth/session";
import { GraphQLError } from "graphql/error";
import { UpdateTicketSchema } from "@/lib/validators/ticket-detail.schema";
import { validateSpecificValueFormat } from "@/lib/validators/specific-value.schema";
import { computeDueDate, computeDueWorkDate } from "@/lib/ticket/dueDate";
import { autoAssign } from "@/lib/ticket/autoAssign";
import { assertCanUpdateTicket } from "@/lib/casl/abilities/ticket/guards";
import { defineAbility } from "@/lib/casl/defineAbility";
import { getAllowedCategories } from "@/lib/casl/abilities/category/guards";
import { getSpecificMapping, getFieldsForTable } from "./specific-field-config";

export async function updateTicket(_parent: unknown, args: { id: number; input: unknown }) {
  // ============================================================
  // 1. AUTH & INPUT
  // ============================================================
  const session = await requireSession();
  const ability = defineAbility(session);
  const prisma = await getPrisma();

  const result = UpdateTicketSchema.safeParse(args.input);
  if (!result.success) {
    throw new GraphQLError("Invalid input", {
      extensions: { code: "BAD_USER_INPUT", issues: result.error.flatten() },
    });
  }
  const input = result.data;

  // ============================================================
  // 2. LOAD EXISTING TICKET
  // ============================================================
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

  // ============================================================
  // 3. AUTHORIZATION (CASL)
  // ============================================================
  // Permessi campo per campo + transizioni di stato: va fatto PRIMA di
  // qualsiasi calcolo su categoria/specifica, così un utente senza i permessi
  // giusti si ferma qui senza che il resolver faccia lavoro inutile.
  assertCanUpdateTicket(ability, session, existing, input);

  // ============================================================
  // 4. BUSINESS RULE: dueDate ↔ transizione a IN_PROGRESS
  // ============================================================
  // CASL autorizza il campo `dueDate` in base allo STATO ATTUALE del ticket
  // (ASSIGNED o IN_PROGRESS), ma non sa cosa contiene il resto del payload.
  // Qui aggiungiamo il vincolo di business: la scadenza può essere data/
  // corretta liberamente una volta IN_PROGRESS, oppure impostata
  // contestualmente al passaggio in lavorazione (prima stima esplicita).
  //
  // Le due variabili sono condivise anche con la sezione 8, dove decidiamo
  // se calcolare un default automatico per la dueDate.
  const isAlreadyInProgress = existing.status === "IN_PROGRESS";
  const isTransitioningToInProgress =
    (existing.status === "ASSIGNED" || existing.status === "REOPENED") &&
    input.status === "IN_PROGRESS";

  if (input.dueDate !== undefined && !isAlreadyInProgress && !isTransitioningToInProgress) {
    throw new GraphQLError(
      "dueDate can only be set when the ticket enters IN_PROGRESS, or once it is already IN_PROGRESS",
      { extensions: { code: "DUE_DATE_NOT_ALLOWED" } }
    );
  }

  // ============================================================
  // 5. CATEGORY RESOLUTION
  // ============================================================
  // targetCategory rappresenta la categoria "di destinazione" dopo l'update:
  // - input.categoryId === undefined -> la categoria non cambia, resta quella esistente
  // - input.categoryId === null      -> il ticket viene portato a "nessuna categoria"
  // - input.categoryId === <id>      -> nuova categoria, va validata come consentita per l'utente
  let targetCategory: Awaited<ReturnType<typeof getAllowedCategories>>[number] | null = existing.category;

  if (input.categoryId !== undefined) {
    if (input.categoryId === null) {
      targetCategory = null;
    } else {
      const allowedCategories = await getAllowedCategories(prisma, ability);

      const found = allowedCategories.find((c) => c.id === input.categoryId);
      if (!found) {
        throw new GraphQLError("Category not found for this user", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      targetCategory = found;
    }
  }

  const categoryId = input.categoryId !== undefined ? input.categoryId : existing.categoryId;

  // ============================================================
  // 6. ASSIGNMENT RESOLUTION
  // ============================================================
  // Include: validazione utente assegnato, check specializzazione,
  // auto-assegnazione per cambio categoria, e la transizione di stato
  // automatica che ne consegue (OPEN -> ASSIGNED).
  if (input.assignedToId !== undefined && input.assignedToId !== null) {
    const assignee = await prisma.user.findUnique({ where: { id: input.assignedToId } });
    if (!assignee) {
      throw new GraphQLError("User for assigned to not found", { extensions: { code: "ASSIGNED_TO_ERROR" } });
    }

    if (categoryId !== null) {
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
  }

  let status = input.status;
  let assignedToId = input.assignedToId;

  if (
    input.assignedToId !== undefined &&
    input.assignedToId !== null &&
    existing.status === "OPEN"
  ) {
    status = "ASSIGNED";
  }

  if (input.categoryId !== undefined && input.categoryId !== null && input.assignedToId === undefined) {
    assignedToId = await autoAssign(prisma, input.categoryId, existing.createdById);
    status = "ASSIGNED";
  }

  // ============================================================
  // 7. STATUS TRANSITIONS (closing / reopening)
  // ============================================================
  // Un ticket è "riaperto" quando ERA chiuso ed esce da quello stato verso
  // un altro. Va distinto da:
  // - status non toccato in questo update (input.status === undefined)
  // - il ticket resta in uno stato chiuso (es. CLOSED -> REFUSED), che è
  //   una closing transition, non una reopen transition.
  const isClosingTransition = status === "CLOSED" || status === "REFUSED";

  const wasClosed = existing.status === "CLOSED";
  const isReopenTransition =
    wasClosed && input.status !== undefined && !isClosingTransition;

  if (isReopenTransition && !input.reopenReason) {
    throw new GraphQLError(
      "reopenReason is required when reopening a ticket",
      { extensions: { code: "REOPEN_REASON_REQUIRED" } }
    );
  }

  let closedAt: Date | null | undefined = undefined;

  if (input.status === "CLOSED") {
    closedAt = new Date();
  } else if (isReopenTransition) {
    // riapertura: il closedAt apparteneva alla chiusura precedente, lo azzeriamo.
    closedAt = null;
  }

  // closingMessage arriva già validato come obbligatorio quando status è
  // CLOSED/REFUSED (vedi superRefine nello schema). Lo salvo sia sul Ticket
  // (cache per lettura rapida) sia come TicketMessage dedicato.
  // Alla riapertura lo azzero: è un residuo della vita precedente e alla
  // prossima chiusura verrà riscritto ex-novo.
  const closingMessage = isClosingTransition
    ? input.closingMessage
    : isReopenTransition
      ? null
      : undefined;

  // ============================================================
  // 8. DUE DATE COMPUTATION
  // ============================================================
  let dueDate: Date | null | undefined = undefined;

  if (isReopenTransition) {
    // Riapertura: la dueDate era quella della vita precedente del ticket,
    // ormai inutilizzabile. La azzeriamo: sarà il tecnico a rimetterla
    // quando il ticket rientrerà in IN_PROGRESS.
    dueDate = null;
  } else if (input.dueDate !== undefined) {
    // Il tecnico ha specificato esplicitamente una data: rispettala sempre,
    // sia in transizione a IN_PROGRESS sia in una correzione/estensione
    // successiva (il campo resta sempre modificabile).
    dueDate = input.dueDate;
  } else if (isTransitioningToInProgress) {
    // Prima stima automatica: il tecnico porta il ticket in lavorazione
    // senza indicare una dueDate esplicita. Non lasciamo il campo vuoto:
    // calcoliamo un default a partire dalla priorità effettiva del ticket
    // (che potrebbe essere cambiata nello stesso payload), così il
    // creatore ha comunque un riferimento temporale visibile subito.
    const effectivePriority = input.priority ?? existing.priority;

    dueDate = computeDueWorkDate(
      effectivePriority,
      existing.dueFirstResponse ?? existing.createdAt
    );
  }

  // ============================================================
  // 8b. DUE FIRST RESPONSE DATE COMPUTATION
  // ============================================================
  let dueFirstResponse: Date | undefined = undefined;

  if (isReopenTransition) {
    // Alla riapertura lo SLA della prima risposta riparte da oggi,
    // calcolato sulla priorità effettiva (payload se diversa, altrimenti
    // quella attuale del ticket).
    dueFirstResponse = computeDueDate(input.priority ?? existing.priority);
  } else if (input.priority !== undefined && input.priority !== existing.priority) {
    dueFirstResponse = computeDueDate(input.priority);
  }

  // ============================================================
  // 9. SPECIFIC FIELD MAPPING
  // ============================================================
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

  // 9.1 Cambio categoria verso una categoria che richiede una specifica,
  //     ma la specifica non è stata mandata nello stesso payload.
  if (categoryChanged && newMapping && input.specificValue == null) {
    throw new GraphQLError(
      `The selected category requires to specify the correct specific, "${newMapping.field}"`,
      { extensions: { code: "SPECIFIC_VALUE_REQUIRED" } }
    );
  }

  // 9.2 Specifica mandata ma la categoria di destinazione non ne prevede nessuna
  //     (categoria senza specificField, o categoryId portato a null).
  if (!newMapping && input.specificValue != null) {
    throw new GraphQLError(
      "The category doesn't have or requires any specific value",
      { extensions: { code: "NO_SPECIFIC_VALUE" } }
    );
  }

  // 9.3 Valore fuori dall'enum ammesso per il campo specifico di destinazione.
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

  // 9.4 Formato del riferimento per i campi testo libero
  //     (es. INVOICE_REFERENCE): controllato sulla specifica della categoria
  //     di destinazione. Messaggio inglese per lo sviluppatore; l'utente vede
  //     quello mappato da "WRONG_SPECIFIC" nel notificationLink.
  if (
    newMapping &&
    input.specificValue != null &&
    targetCategory?.specificField &&
    validateSpecificValueFormat(targetCategory.specificField, input.specificValue)
  ) {
    throw new GraphQLError(
      `Invalid format for ${targetCategory.specificField} reference`,
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

  // ============================================================
  // 10. PERSIST (transazione: update + snapshot storico)
  // ============================================================
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
        dueFirstResponse,
        lastUpdatedById: session.userId,
        closingMessage,
        ...(isReopenTransition && {
          reopenCount: { increment: 1 },
          reopenReason: input.reopenReason,
        }),
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

    await tx.ticketHistory.create({
      data: buildTicketHistoryData(result, {
        ticketSpecific:
          input.specificValue != null ? input.specificValue : oldSpecificValue,
      }),
    });

    return result;
  });

  return updated;
}