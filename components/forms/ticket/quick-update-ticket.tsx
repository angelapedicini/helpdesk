// components/forms/ticket/quick-update-ticket.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, TextField } from "@mui/material";
import { skipToken, useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { SEARCH_USERS } from "@/apollo-client/queries/user/search";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { UPDATE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";
import { SOLE_SPECIALIST_CATEGORY_IDS, USERS_SPEC_BY_CATID } from "@/apollo-client/queries/user-specialization/user-specialization.queries";

import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";

import type { TicketFieldsFragment } from "@/graphql-generated/graphql";

import type { TicketPriority, TicketStatus } from "@/lib/validators/enums.schema";

import {
    UpdateTicketInput,
    UpdateTicketOutput,
    createUpdateTicketSchema,
} from "@/lib/validators/ticket-detail.schema";

import {
    useTicketAllowedStatuses,
    useTicketAssigneeBrowseMode,
    useTicketUpdatePermissions,
} from "@/lib/casl/abilities/ticket/hook-permission";
import { computeDueWorkDate } from "@/lib/ticket/dueDate";
import { toCalendarUTCDate, toPickerValue } from "@/lib/helper/formt-helpers";

import { AppSelect } from "../inputs/select-input";
import { useResetRegistry } from "../hooks/use-reset-registry";
import { SearchInput, type SearchResult } from "../inputs/search-input";
import { SpecificFieldInput } from "../inputs/specific-field-input";
import FormLayout from "../form-layout";

type QuickUpdateTicketFormProps = {
    ticket: TicketFieldsFragment;
    onSubmit: (
        values: UpdateTicketOutput
    ) => void | Promise<void>;
};

/**
 * Versione minimale del form di aggiornamento ticket, pensata per la modale.
 *
 * Si distingue dal form principale (components/forms/ticket/update-ticket.tsx)
 * per un unico motivo: invece di disabilitare i campi che l'utente non può
 * toccare, non li renderizza. La decisione è la stessa e arriva dalla stessa
 * sorgente (ability.can("update", subject, field)), cambia solo la
 * conseguenza: `disabled` -> campo assente.
 *
 * I campi condizionali (messaggio di chiusura, motivo di riapertura) e
 * l'anteprima della scadenza restano quelli del form principale: la
 * validazione lato server è la stessa e non ha senso trattarli diversi.
 * L'anteprima "Prima risposta entro" invece è read-only per tutti, quindi
 * con la regola "quello che non puoi modificare non si mostra" viene omessa.
 */

// specificField (es. "HARDWARE_TYPE") e la property corrispondente in
// specificData (es. "hardwareType") differiscono solo per il case, quindi
// basta una conversione SCREAMING_SNAKE_CASE -> camelCase per leggere il
// valore attuale del ticket, senza bisogno di una tabella.
function mapTicketToFormValues(
    ticket: TicketFieldsFragment
): UpdateTicketInput {
    const specificField = ticket.category?.specificField;
    let specificValue: string | undefined;

    if (specificField && ticket.specificData) {
        const key = specificField
            .toLowerCase()
            .replace(/_([a-z])/g, (_, c) => c.toUpperCase());

        const value = (ticket.specificData as Record<string, unknown>)[key];
        specificValue = typeof value === "string" ? value : undefined;
    }

    return {
        title: ticket.title,
        description: ticket.description ?? "",
        status: ticket.status,
        priority: ticket.priority ?? undefined,
        categoryId: ticket.category?.id ?? null,
        assignedToId: ticket.assignedTo?.id ?? null,
        closingMessage: ticket.closingMessage ?? undefined,
        dueDate: ticket.dueDate ?? undefined,
        specificValue,
        reopenReason: ticket.reopenReason ?? undefined,
    };
}

export default function QuickUpdateTicketForm({
    ticket,
    onSubmit,
}: QuickUpdateTicketFormProps) {
    const { registerReset, resetAll } = useResetRegistry();

    const defaultValues = useMemo(
        () => mapTicketToFormValues(ticket),
        [ticket]
    );

    const { fields: fieldPermissions, hasAnyEditableField } =
        useTicketUpdatePermissions(ticket);

    // Label iniziale per il campo "Tecnico assegnato"
    const assignedToInitialLabel = ticket.assignedTo
        ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
        : undefined;

    const { data: categoriesData } = useQuery(GET_CATEGORIES, {
        variables: {
            department: ticket.ticketDepartment,
        },
        skip: !ticket.ticketDepartment,
    });

    // Lista "ricca" delle categorie disponibili, con specificField incluso,
    // usata solo per derivare quale campo dinamico mostrare in base alla
    // categoria correntemente selezionata nel form (non quella originale
    // del ticket). categoryOptions più sotto resta quella "leggera" per l'AppSelect.
    const categoriesWithSpecificField = useMemo(() => {
        const list = categoriesData?.categories ?? [];

        if (ticket.category && !list.some((c) => c.id === ticket.category!.id)) {
            return [...list, ticket.category];
        }

        return list;
    }, [categoriesData, ticket.category]);

    // Resolver stabile: deriva lo schema dal categoryId dei values correnti,
    // così il formato della specifica segue la categoria selezionata senza
    // dover ricreare il resolver all'interno di useForm.
    const resolver: Resolver<UpdateTicketInput, undefined, UpdateTicketOutput> =
        useCallback(
            (values, _ctx, options) =>
                zodResolver(
                    createUpdateTicketSchema(
                        categoriesWithSpecificField.find(
                            (c) => c.id === Number(values.categoryId)
                        )?.specificField
                    )
                )(values, _ctx, options),
            [categoriesWithSpecificField]
        );

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<UpdateTicketInput, undefined, UpdateTicketOutput>({
        resolver,
        defaultValues,
        mode: "onChange",
    });

    const createdBy = ticket.createdBy;

    const canSeeSoleSpecialistHint =
        ticket.sourceDepartmentForUser === ticket.ticketDepartment;

    const { data: soleCategoriesData } = useQuery(
        SOLE_SPECIALIST_CATEGORY_IDS,
        canSeeSoleSpecialistHint && createdBy
            ? { variables: { department: ticket.ticketDepartment, userId: createdBy.id } }
            : skipToken
    );

    const soleSpecialistCategoryIds = useMemo(
        () => new Set(soleCategoriesData?.soleSpecialistCategoryIds ?? []),
        [soleCategoriesData]
    );

    const selectedCategoryId = watch("categoryId");
    const categoryIdForQuery = Number(selectedCategoryId);
    const hasValidCategoryId = selectedCategoryId != null && !Number.isNaN(categoryIdForQuery);

    const isSoleSpecialist = hasValidCategoryId && soleSpecialistCategoryIds.has(categoryIdForQuery);

    // Il messaggio di chiusura va mostrato solo quando lo stato selezionato
    // nel form è CLOSED o REFUSED (coerente con la regola in UpdateTicketSchema)
    const selectedStatus = watch("status");
    const showClosingMessage =
        selectedStatus === "CLOSED" || selectedStatus === "REFUSED";

    // Il motivo della riapertura va mostrato solo quando lo stato selezionato
    // nel form è REOPENED (coerente con la regola in UpdateTicketSchema).
    const showReopenReason = selectedStatus === "REOPENED";

    const assigneeBrowseMode = useTicketAssigneeBrowseMode(ticket);

    const { data: deptUsersData, loading: loadingDeptUsers } = useQuery(
        SEARCH_USERS,
        assigneeBrowseMode === "list" && ticket.ticketDepartment
            ? {
                variables: {
                    role: "TECHNICIAN",
                    categoryId: ticket.category?.id,
                    department: ticket.ticketDepartment,
                },
            }
            : skipToken
    );

    const deptUserOptions = useMemo(
        () =>
            (deptUsersData?.searchUsers ?? [])
                .filter((u): u is typeof u & { id: number } => u?.id != null)
                .map((u) => ({
                    id: u.id,
                    label: `${u.firstName} ${u.lastName}`,
                })),
        [deptUsersData]
    );

    const [searchUsers, { loading: loadingUsers }] = useLazyQuery(USERS_SPEC_BY_CATID);

    async function handleSearchUsers(search: string): Promise<SearchResult[]> {
        const { data } = await searchUsers({
            variables: {
                search,
                categoryId: ticket.category!.id,
            },
        });

        return (data?.usersForCategoryId ?? []).map((u) => ({
            id: u.id,
            label: `${u.firstName} ${u.lastName}`,
        }));
    }

    const categoryOptions = useMemo(() => {
        const options = (categoriesData?.categories ?? []).map((c) => ({
            id: c.id,
            label: c.name,
        }));

        // Se la categoria del ticket non è ancora tra le opzioni caricate
        // (query in corso, o categoria fuori dal dipartimento corrente),
        // la aggiungiamo comunque per evitare il mismatch di MUI.
        if (ticket.category && !options.some((o) => o.id === ticket.category!.id)) {
            options.push({
                id: ticket.category.id,
                label: ticket.category.name,
            });
        }

        return options;
    }, [categoriesData, ticket.category]);

    const selectedCategory = useMemo(
        () => categoriesWithSpecificField.find((c) => c.id === categoryIdForQuery),
        [categoriesWithSpecificField, categoryIdForQuery]
    );

    // Ref: traccia se l'utente ha scelto MANUALMENTE una dueDate, per non
    // farla sovrascrivere dal suggerimento automatico (vedi effect sotto).
    const dueDateManuallyEditedRef = useRef(false);

    useEffect(() => {
        reset(defaultValues);
        resetAll();
        dueDateManuallyEditedRef.current = false;
    }, [defaultValues, reset, resetAll]);

    // Reset/ripristino di specificValue quando cambia la categoria selezionata,
    // coerente con la regola lato server (categoria diversa -> specifica azzerata).
    // Va tenuto separato dall'effect sopra: quello scatta al cambio di `ticket`
    // (nuovo ticket caricato), questo scatta al cambio di selezione nel form.
    const previousCategoryIdRef = useRef(defaultValues.categoryId);

    useEffect(() => {
        previousCategoryIdRef.current = defaultValues.categoryId;
    }, [defaultValues.categoryId]);

    useEffect(() => {
        if (selectedCategoryId === previousCategoryIdRef.current) return;
        previousCategoryIdRef.current = selectedCategoryId;

        if (selectedCategoryId === defaultValues.categoryId) {
            // l'utente è tornato alla categoria originale del ticket:
            // ripristina il valore che c'era già, non ha senso perderlo
            setValue("specificValue", defaultValues.specificValue, {
                shouldDirty: false,
            });
        } else {
            setValue("specificValue", undefined, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [selectedCategoryId, defaultValues, setValue]);

    const allowedStatuses = useTicketAllowedStatuses(ticket);

    const statusOptions = (
        Object.keys(TICKET_STATUS_CONFIG) as TicketStatus[]
    )
        .filter((id) => id === ticket.status || allowedStatuses.includes(id))
        .map((id) => ({
            id,
            label: TICKET_STATUS_CONFIG[id].label,
            icon: TICKET_STATUS_CONFIG[id].icon,
            color: TICKET_STATUS_CONFIG[id].color,
            disabled: id === ticket.status,
        }));

    const priorityOptions = (
        Object.keys(TICKET_PRIORITY_CONFIG) as TicketPriority[]
    ).map((id) => ({
        id,
        label: TICKET_PRIORITY_CONFIG[id].label,
        icon: TICKET_PRIORITY_CONFIG[id].icon,
        color: TICKET_PRIORITY_CONFIG[id].color,
    }));

    // ============================================================
    // DEFAULT: dueDate
    // ============================================================
    // Mirror delle regole di business calcolate lato server in
    // modules/ticket/resolvers/mutations/update.ts (sezioni 4 e 8).
    // Usiamo la stessa funzione pura di lib/ticket/dueDate.ts, quindi nessun
    // rischio di drift nella formula: replichiamo solo le CONDIZIONI sotto cui
    // il resolver decide di ricalcolare la scadenza.

    // sezione 4 update.ts: la dueDate è editabile solo se il ticket è già
    // IN_PROGRESS, o se questo update lo fa entrare in IN_PROGRESS.
    const isAlreadyInProgress = ticket.status === "IN_PROGRESS";
    const isTransitioningToInProgress =
        ticket.status === "ASSIGNED" && selectedStatus === "IN_PROGRESS";

    const selectedPriority = watch("priority");

    // sezione 8 update.ts: il default per dueDate viene calcolato SOLO nella
    // transizione ASSIGNED -> IN_PROGRESS, usando la priority "effettiva"
    // (quella scelta nel form, o quella esistente come fallback) e come ancora
    // dueFirstResponse (o createdAt se manca).
    const effectivePriorityForDueDate = selectedPriority ?? ticket.priority ?? undefined;

    const suggestedDueDate = useMemo(() => {
        if (!isTransitioningToInProgress || !effectivePriorityForDueDate) return undefined;

        const anchor = ticket.dueFirstResponse
            ? new Date(ticket.dueFirstResponse)
            : new Date(ticket.createdAt);

        return computeDueWorkDate(effectivePriorityForDueDate, anchor);
    }, [
        isTransitioningToInProgress,
        effectivePriorityForDueDate,
        ticket.dueFirstResponse,
        ticket.createdAt,
    ]);

    // Applica/ritira il suggerimento nel campo dueDate, ma solo se l'utente
    // non l'ha già editato manualmente (coerente con la regola "un valore
    // esplicito prevale sempre sul default" del resolver).
    useEffect(() => {
        if (dueDateManuallyEditedRef.current) return;

        if (suggestedDueDate) {
            setValue("dueDate", suggestedDueDate, { shouldDirty: false });
        } else if (!isAlreadyInProgress) {
            // fuori dalla transizione e non già IN_PROGRESS: il BE non
            // accetterebbe comunque una dueDate, quindi torniamo al valore originale
            setValue("dueDate", defaultValues.dueDate, { shouldDirty: false });
        }
    }, [suggestedDueDate, isAlreadyInProgress, defaultValues.dueDate, setValue]);

    const [updateTicket] = useMutation(UPDATE_TICKET, {
        context: {
            successMessage:
                "Il ticket #{id} è stato modificato con successo.",
        },
        update(cache) {
            cache.evict({ fieldName: "tickets" });
            cache.evict({ fieldName: "ticketHistoryByTicketId" });
            cache.evict({ fieldName: "dashboard" });
            cache.gc();
        },
    });

    const defaultValuesOutput = useMemo(
        () => defaultValues,
        [defaultValues]
    );

    const handleFormSubmit = async (
        values: UpdateTicketOutput
    ) => {
        /*
         * Inviamo solamente i campi il cui valore finale
         * è realmente diverso dal valore originale.
         *
         * Non usiamo dirtyFields perché un campo può essere
         * modificato e poi riportato al valore originale.
         */

        const changedValues: UpdateTicketOutput = {};

        if (values.title !== defaultValuesOutput.title) {
            changedValues.title = values.title;
        }

        if (values.description !== defaultValuesOutput.description) {
            changedValues.description = values.description;
        }

        if (values.status !== defaultValuesOutput.status) {
            changedValues.status = values.status;
        }

        if (values.priority !== defaultValuesOutput.priority) {
            changedValues.priority = values.priority;
        }

        if (values.categoryId !== defaultValuesOutput.categoryId) {
            changedValues.categoryId = values.categoryId;
        }

        if (values.assignedToId !== defaultValuesOutput.assignedToId) {
            changedValues.assignedToId = values.assignedToId;
        }

        if (values.closingMessage !== defaultValuesOutput.closingMessage) {
            changedValues.closingMessage = values.closingMessage;
        }

        if (values.dueDate !== defaultValuesOutput.dueDate) {
            changedValues.dueDate = values.dueDate;
        }

        if (values.specificValue !== defaultValuesOutput.specificValue) {
            changedValues.specificValue = values.specificValue;
        }

        if (values.reopenReason !== defaultValuesOutput.reopenReason) {
            changedValues.reopenReason = values.reopenReason;
        }

        /*
         * Nessuna modifica reale.
         * Evitiamo completamente la mutation GraphQL.
         */
        if (Object.keys(changedValues).length === 0) {
            onSubmit(values);
            return;
        }

        const result = await updateTicket({
            variables: {
                id: ticket.id,
                input: {
                    ...changedValues,
                    dueDate: changedValues.dueDate?.toISOString(),
                },
            },
        });

        // Su errore restiamo nella modale: l'errore lo mostra notificationLink.
        if (result.error) {
            return;
        }

        onSubmit(changedValues);
    };

    const handleReset = () => {
        reset(defaultValues); // valori RHF (id, status, priority, ecc.)
        resetAll();           // testo visualizzato nei campi search → torna a initialLabel
        dueDateManuallyEditedRef.current = false;
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            sx={{
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <FormLayout
                actions={
                    <>
                        <Button
                            type="button"
                            variant="outlined"
                            disabled={isSubmitting || !isDirty}
                            onClick={handleReset}
                        >
                            Ripristina
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting || !hasAnyEditableField}
                        >
                            Salva
                        </Button>
                    </>
                }
            >
                {!hasAnyEditableField ? (
                    <Alert severity="info">
                        Non ci sono campi che puoi modificare su questo ticket.
                    </Alert>
                ) : (
                    // Una sola colonna: la modale è maxWidth="sm", quindi due
                    // colonne affiancate resterebbero troppo strette.
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: 3,
                        }}
                    >
                        {fieldPermissions.status && (
                            <AppSelect
                                name="status"
                                label="Status"
                                control={control}
                                options={statusOptions}
                            />
                        )}

                        {fieldPermissions.priority && (
                            <AppSelect
                                name="priority"
                                label="Priorità"
                                control={control}
                                options={priorityOptions}
                            />
                        )}

                        {fieldPermissions.assignedToId && (
                            assigneeBrowseMode === "list" ? (
                                <AppSelect
                                    name="assignedToId"
                                    label="Tecnico assegnato"
                                    control={control}
                                    options={deptUserOptions}
                                    disabled={loadingDeptUsers}
                                />
                            ) : (
                                <SearchInput
                                    name="assignedToId"
                                    label="Tecnico assegnato"
                                    control={control}
                                    onSearch={handleSearchUsers}
                                    loading={loadingUsers}
                                    initialLabel={assignedToInitialLabel}
                                    registerReset={registerReset}
                                />
                            )
                        )}

                        {fieldPermissions.categoryId && (
                            <AppSelect
                                name="categoryId"
                                label="Categoria"
                                control={control}
                                options={categoryOptions}
                            />
                        )}

                        {fieldPermissions.specificValue && (
                            <SpecificFieldInput
                                specificField={selectedCategory?.specificField}
                                control={control}
                                error={errors.specificValue?.message}
                            />
                        )}

                        {fieldPermissions.dueDate && (
                            <Controller
                                name="dueDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Scadenza"
                                        value={toPickerValue(field.value)}
                                        onChange={(date) => {
                                            dueDateManuallyEditedRef.current = true;
                                            field.onChange(toCalendarUTCDate(date));
                                        }}
                                        slotProps={{
                                            textField: {
                                                error: !!errors.dueDate,
                                                helperText: errors.dueDate?.message,
                                            },
                                        }}
                                    />
                                )}
                            />
                        )}

                        {fieldPermissions.title && (
                            <TextField
                                {...register("title")}
                                label="Titolo"
                                fullWidth
                                error={!!errors.title}
                                helperText={errors.title?.message}
                            />
                        )}

                        {fieldPermissions.description && (
                            <TextField
                                {...register("description")}
                                label="Descrizione"
                                fullWidth
                                multiline
                                minRows={3}
                                error={!!errors.description}
                                helperText={errors.description?.message}
                            />
                        )}

                        {showClosingMessage && fieldPermissions.closingMessage && (
                            <TextField
                                {...register("closingMessage")}
                                label="Messaggio di chiusura"
                                fullWidth
                                multiline
                                minRows={3}
                                error={!!errors.closingMessage}
                                helperText={errors.closingMessage?.message}
                            />
                        )}

                        {showReopenReason && fieldPermissions.reopenReason && (
                            <TextField
                                {...register("reopenReason")}
                                label="Motivo della riapertura"
                                fullWidth
                                multiline
                                minRows={2}
                                error={!!errors.reopenReason}
                                helperText={errors.reopenReason?.message}
                            />
                        )}

                        {isSoleSpecialist && createdBy && (
                            <Alert severity="info">
                                {`${createdBy.firstName} ${createdBy.lastName}`} è l&apos;unico tecnico con
                                questa specializzazione: il ticket verrà assegnato automaticamente a
                                lui/lei al salvataggio.
                            </Alert>
                        )}
                    </Box>
                )}
            </FormLayout>
        </Box>
    );
}