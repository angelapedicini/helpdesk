// components/forms/ticket/ticket.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Button,
    TextField,
} from "@mui/material";
import { useLazyQuery, useMutation } from "@apollo/client/react";

import { SEARCH_USERS } from "@/apollo-client/queries/user/search";
import { useAppQuery } from "@/apollo-client/hooks/query-hook";
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
import { AppSelect } from "../inputs/search-input2";
// import { SearchInput, SearchResult } from "../inputs/search-input3";
import { useResetRegistry } from "../hooks/use-reset-registry";
import { SearchInput, SearchResult } from "../inputs/auto-complete";

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

    // const {
    //     register,
    //     control,
    //     handleSubmit,
    //     reset,
    //     formState: {
    //         errors,
    //         isSubmitting,
    //         isDirty,
    //     },
    // } = useForm<UpdateTicketInput, undefined, UpdateTicketOutput>({
    //     resolver: zodResolver(UpdateTicketSchema),
    //     defaultValues,
    // });

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<UpdateTicketInput, undefined, UpdateTicketOutput>({
        resolver: zodResolver(UpdateTicketSchema),
        defaultValues,
    });

    // const [searchUsers, { loading: loadingUsers }] =
    //     useLazyQuery(SEARCH_USERS);

    // const [searchUsers, { loading: loadingUsers }] = useLazyQuery(SEARCH_USERS);

    // async function handleSearchUsers(search: string): Promise<SearchResult[]> {
    //     const { data } = await searchUsers({
    //         variables: {
    //             search,
    //             role: "TECHNICIAN",
    //             department: ticket.ticketDepartment,
    //         },
    //     });

    //     return (data?.searchUsers ?? []).map((u) => ({
    //         id: u.id,
    //         label: `${u.firstName} ${u.lastName}`,
    //     }));
    // }

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

    const { data: categories } = useAppQuery(GET_CATEGORIES, {
        variables: {
            department: ticket.ticketDepartment,
        },
        skip: !ticket.ticketDepartment,
    });

    const categoryOptions = (categories ?? []).map((c) => ({
        id: c.id,
        label: c.name,
    }));

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

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

                {/* <SearchInput
                    name="assignedToId"
                    label="Tecnico assegnato"
                    control={control}
                    execute={searchUsers}
                    variables={{
                        role: "TECHNICIAN",
                        department: ticket.ticketDepartment,
                    }}
                    mapData={(data) =>
                        (data?.searchUsers ?? []).map((u) => ({
                            id: u.id,
                            label: `${u.firstName} ${u.lastName}`,
                        }))
                    }
                    loading={loadingUsers}
                    initialLabel={assignedToInitialLabel}
                // disabled={!fieldPermissions.assignedToId}
                /> */}

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

                {/* <SearchAutocomplete
                    name="assignedToId"
                    control={control}
                    label="Tecnico assegnato"
                    loading={loadingUsers}
                    disabled={!fieldPermissions.assignedToId}
                    initialLabel={assignedToInitialLabel}
                    onSearch={handleSearchUsers}
                /> */}
                <AppSelect
                    name="status"
                    label="Status"
                    control={control}
                    options={statusOptions}
                    disabled={!fieldPermissions.status}
                />

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