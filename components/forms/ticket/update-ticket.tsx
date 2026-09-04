// components/forms/ticket/ticket.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Alert,
    Box,
    Button,
    TextField,
} from "@mui/material";
import { skipToken, useLazyQuery, useMutation, useQuery } from "@apollo/client/react";

import { SEARCH_USERS } from "@/apollo-client/queries/user/search";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";

import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";

import type { TicketFieldsFragment } from "@/apollo-client/gql/graphql";

import {
    TicketPriority,
    TicketStatus,
} from "@/lib/validators/enums.schema";

import {
    UpdateTicketInput,
    UpdateTicketOutput,
    UpdateTicketSchema,
} from "@/lib/validators/ticket-detail.schema";

import { UPDATE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";

import { AppSelect } from "../inputs/select-input";
import { useResetRegistry } from "../hooks/use-reset-registry";
import { SearchInput, SearchResult } from "../inputs/search-input";
import { SpecificFieldInput } from "../inputs/specific-field-input";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { toCalendarUTCDate, toPickerValue } from "@/lib/helper/formt-helpers";
import { useTicketUpdatePermissions } from "@/lib/casl/abilities/ticket/presentation";
import { SOLE_SPECIALIST_CATEGORY_IDS, USERS_SPEC_BY_CATID } from "@/apollo-client/queries/user-specialization/user-specialization.queries";


type TicketDetailFormProps = {
    ticket: TicketFieldsFragment;
    onSubmit: (
        values: UpdateTicketOutput
    ) => void | Promise<void>;
};

// specificField (es. "HARDWARE_TYPE") e la property corrispondente in
// specificData (es. "hardwareType") differiscono solo per il case,
// quindi basta una conversione SCREAMING_SNAKE_CASE -> camelCase per
// leggere il valore attuale del ticket, senza bisogno di una tabella.
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
    };
}

export default function TicketDetailForm({
    ticket,
    onSubmit,
}: TicketDetailFormProps) {
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

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<UpdateTicketInput, undefined, UpdateTicketOutput>({
        resolver: zodResolver(UpdateTicketSchema),
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

    const { data: categoriesData } = useQuery(GET_CATEGORIES, {
        variables: {
            department: ticket.ticketDepartment,
        },
        skip: !ticket.ticketDepartment,
    });

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

    // Lista "ricca" delle categorie disponibili, con specificField incluso,
    // usata solo per derivare quale campo dinamico mostrare in base alla
    // categoria correntemente selezionata nel form (non quella originale
    // del ticket). categoryOptions sopra resta quella "leggera" per l'AppSelect.
    const categoriesWithSpecificField = useMemo(() => {
        const list = categoriesData?.categories ?? [];

        if (ticket.category && !list.some((c) => c.id === ticket.category!.id)) {
            return [...list, ticket.category];
        }

        return list;
    }, [categoriesData, ticket.category]);

    const selectedCategory = useMemo(
        () => categoriesWithSpecificField.find((c) => c.id === categoryIdForQuery),
        [categoriesWithSpecificField, categoryIdForQuery]
    );

    useEffect(() => {
        reset(defaultValues);
        resetAll();
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

    const statusOptions = (
        Object.keys(TICKET_STATUS_CONFIG) as TicketStatus[]
    ).map((id) => ({
        id,
        label: TICKET_STATUS_CONFIG[id].label,
        icon: TICKET_STATUS_CONFIG[id].icon,
        color: TICKET_STATUS_CONFIG[id].color,
    }));

    const priorityOptions = (
        Object.keys(TICKET_PRIORITY_CONFIG) as TicketPriority[]
    ).map((id) => ({
        id,
        label: TICKET_PRIORITY_CONFIG[id].label,
        icon: TICKET_PRIORITY_CONFIG[id].icon,
        color: TICKET_PRIORITY_CONFIG[id].color,
    }));

    const [updateTicket] = useMutation(UPDATE_TICKET, {
        context: {
            successMessage:
                "Il ticket #{id} è stato modificato con successo.",
        },
        update(cache) {
            cache.evict({
                fieldName: "tickets",
            });

            cache.gc();
        },
    });

    const defaultValuesOutput = useMemo(
        () => UpdateTicketSchema.parse(defaultValues),
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

        if (result.error) {
            return;
        }

        onSubmit(changedValues);
    };

    const handleReset = () => {
        reset(defaultValues); // valori RHF (id, status, priority, ecc.)
        resetAll();           // testo visualizzato nei campi search → torna a initialLabel
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
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                    },
                    gap: 3,
                }}
            >
                <TextField
                    {...register("title")}
                    label="Titolo"
                    fullWidth
                    disabled={!fieldPermissions.title}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                />

                <Controller
                    name="dueDate"
                    control={control}
                    disabled={!fieldPermissions.dueDate}
                    render={({ field }) => (
                        <DatePicker
                            label="Scadenza"
                            value={toPickerValue(field.value)}
                            onChange={(date) => {
                                field.onChange(toCalendarUTCDate(date));
                            }}
                            disabled={!fieldPermissions.dueDate}
                            slotProps={{
                                textField: {
                                    error: !!errors.dueDate,
                                    helperText: errors.dueDate?.message,
                                },
                            }}
                        />
                    )}
                />

                <TextField
                    {...register("description")}
                    label="Descrizione"
                    fullWidth
                    multiline
                    minRows={3}
                    disabled={!fieldPermissions.description}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    sx={{
                        gridColumn: {
                            md: "1 / -1",
                        },
                    }}
                />

                <AppSelect
                    name="categoryId"
                    label="Categoria"
                    control={control}
                    options={categoryOptions}
                    disabled={!fieldPermissions.categoryId}
                />

                <SpecificFieldInput
                    specificField={selectedCategory?.specificField}
                    control={control}
                    error={errors.specificValue?.message}
                />

                <AppSelect
                    name="priority"
                    label="Priorità"
                    control={control}
                    options={priorityOptions}
                    disabled={!fieldPermissions.priority}
                />

                <SearchInput
                    name="assignedToId"
                    label="Tecnico assegnato"
                    control={control}
                    onSearch={handleSearchUsers}
                    loading={loadingUsers}
                    initialLabel={assignedToInitialLabel} // reset → "Mario Rossi"
                    disabled={!fieldPermissions.assignedToId}
                    registerReset={registerReset}
                />

                <AppSelect
                    name="status"
                    label="Status"
                    control={control}
                    options={statusOptions}
                    disabled={!fieldPermissions.status}
                />

                {showClosingMessage && (
                    <TextField
                        {...register("closingMessage")}
                        label="Messaggio di chiusura"
                        fullWidth
                        multiline
                        minRows={3}
                        error={!!errors.closingMessage}
                        helperText={errors.closingMessage?.message}
                        disabled={!fieldPermissions.closingMessage}
                        sx={{
                            gridColumn: {
                                md: "1 / -1",
                            },
                        }}
                    />
                )}

                {isSoleSpecialist && createdBy && (
                    <Alert severity="info" sx={{ gridColumn: { md: "1 / -1" } }}>
                        {`${createdBy.firstName} ${createdBy.lastName}`} è l'unico tecnico con
                        questa specializzazione: il ticket verrà assegnato automaticamente a
                        lui/lei al salvataggio.
                    </Alert>
                )}

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                        gridColumn: {
                            md: "1 / -1",
                        },
                    }}
                >
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
                </Box>
            </Box>
        </Box>
    );
}