// components/forms/ticket/ticket.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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

// import { SearchInput, SearchResult } from "../inputs/search-input";

import {
    UpdateTicketInput,
    UpdateTicketOutput,
    UpdateTicketSchema,
} from "@/lib/validators/ticket-detail.schema";

import { UPDATE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";

import { toTicketSubject } from "@/lib/casl/types";
import { useAbility } from "@/lib/casl/abilityContext";
import { AppSelect } from "../inputs/select-input";
// import { SearchInput, SearchResult } from "../inputs/search-input3";
import { useResetRegistry } from "../hooks/use-reset-registry";
import { SearchInput, SearchResult } from "../inputs/search-input";
import { SOLE_SPECIALIST_CATEGORY_IDS } from "@/apollo-client/queries/user-specialization/user-specialization.queries.ts";


type TicketDetailFormProps = {
    ticket: TicketFieldsFragment;
    onSubmit: (
        values: UpdateTicketOutput
    ) => void | Promise<void>;
};

function mapTicketToFormValues(
    ticket: TicketFieldsFragment
): UpdateTicketInput {
    return {
        title: ticket.title,
        description: ticket.description ?? "",
        status: ticket.status,
        priority: ticket.priority ?? undefined,
        categoryId: ticket.category?.id ?? null,
        assignedToId: ticket.assignedTo?.id ?? null,
        closingMessage: ticket.closingMessage ?? undefined,
    };
}

export default function TicketDetailForm({
    ticket,
    onSubmit,
}: TicketDetailFormProps) {
    const { registerReset, resetAll } = useResetRegistry();
    const ability = useAbility();

    const defaultValues = useMemo(
        () => mapTicketToFormValues(ticket),
        [ticket]
    );

    const ticketSubject = useMemo(
        () => toTicketSubject(ticket),
        [ticket]
    );

    const fieldPermissions = useMemo(
        () => ({
            title: ability.can("update", ticketSubject, "title"),
            description: ability.can("update", ticketSubject, "description"),
            status: ability.can("update", ticketSubject, "status"),
            priority: ability.can("update", ticketSubject, "priority"),
            categoryId: ability.can("update", ticketSubject, "categoryId"),
            assignedToId: ability.can("update", ticketSubject, "assignedToId"),
        }),
        [ability, ticketSubject]
    );

    const hasAnyEditableField = Object.values(fieldPermissions).some(Boolean);

    // Label iniziale per il campo "Tecnico assegnato"
    const assignedToInitialLabel = ticket.assignedTo
        ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
        : undefined;

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<UpdateTicketInput, undefined, UpdateTicketOutput>({
        resolver: zodResolver(UpdateTicketSchema),
        defaultValues,
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

    const [searchUsers, { loading: loadingUsers }] = useLazyQuery(SEARCH_USERS);

    async function handleSearchUsers(search: string): Promise<SearchResult[]> {
        const { data } = await searchUsers({
            variables: {
                search,
                role: "TECHNICIAN",
                department: ticket.ticketDepartment,
            },
        });

        return (data?.searchUsers ?? []).map((u) => ({
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

    useEffect(() => {
        reset(defaultValues);
        resetAll();
    }, [defaultValues, reset, resetAll]);

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

        /*
         * Nessuna modifica reale.
         * Evitiamo completamente la mutation GraphQL.
         */
        if (Object.keys(changedValues).length === 0) {
            onSubmit(values);
            return;
        }

        console.log("=== UPDATE PAYLOAD ===");
        console.log(changedValues);

        const result = await updateTicket({
            variables: {
                id: ticket.id,
                input: changedValues,
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
                    name="priority"
                    label="Priorità"
                    control={control}
                    options={priorityOptions}
                    disabled={!fieldPermissions.priority}
                />

                <AppSelect
                    name="categoryId"
                    label="Categoria"
                    control={control}
                    options={categoryOptions}
                    disabled={!fieldPermissions.categoryId}

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