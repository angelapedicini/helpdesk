// components/forms/ticket/ticket.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField } from "@mui/material";
import { ResultOf } from "@graphql-typed-document-node/core";
import { GET_TICKET_BY_ID } from "@/apollo-client/queries/ticket/ticket.queries";
import {
    TicketDetailSchema,
    TicketDetailFormValues,
    TicketDetailFormOutput,
} from "@/lib/validators/ticket-detail.schema";
import { useAppLazyQuery } from "@/apollo-client/hooks/lazy-query";
import { SEARCH_USERS } from "@/apollo-client/queries/user/search";
import { SearchInput } from "@/components/form-engine/inputs/search-input";
import { useAppQuery } from "@/apollo-client/hooks/query-hook";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { SelectInput } from "@/components/form-engine/inputs/select-input";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { TicketStatus, TicketPriority } from "@/lib/validators/ticket.schema";

type TicketQueryResult = NonNullable<ResultOf<typeof GET_TICKET_BY_ID>["ticket"]>;

type TicketDetailFormProps = {
    ticket: TicketQueryResult;
    onSubmit: (values: TicketDetailFormOutput) => void | Promise<void>;
};

function mapTicketToFormValues(ticket: TicketQueryResult): TicketDetailFormValues {
    return {
        title: ticket.title,
        description: ticket.description ?? "",
        status: ticket.status,
        priority: ticket.priority ?? "",
        categoryId: ticket.category?.id ?? null,
        assignedToId: ticket.assignedTo?.id ?? null,
    };
}

export default function TicketDetailForm({ ticket, onSubmit }: TicketDetailFormProps) {
    const defaultValues = useMemo(() => mapTicketToFormValues(ticket), [ticket]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TicketDetailFormValues, unknown, TicketDetailFormOutput>({
        resolver: zodResolver(TicketDetailSchema),
        defaultValues,
    });

    const { run: runSearchUsers } = useAppLazyQuery(SEARCH_USERS);

    const searchUsers = async (filter: { search?: string }) => {
        const users = await runSearchUsers({ search: filter.search } as never);
        return (users ?? []).map((u) => ({
            id: u.id,
            label: `${u.firstName} ${u.lastName}`,
        }));
    };

    const { data: categories } = useAppQuery(GET_CATEGORIES, {
        variables: { department: ticket.ticketDepartment },
        skip: !ticket.ticketDepartment,
    });

    const categoryOptions = (categories ?? []).map((c) => ({
        id: c.id,
        label: c.name,
    }));

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const statusOptions = (Object.keys(TICKET_STATUS_CONFIG) as TicketStatus[]).map((id) => ({
        id,
        label: TICKET_STATUS_CONFIG[id].label,
    }));

    const priorityOptions = (Object.keys(TICKET_PRIORITY_CONFIG) as TicketPriority[]).map((id) => ({
        id,
        label: TICKET_PRIORITY_CONFIG[id].label,
    }));

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ width: "100%", boxSizing: "border-box" }}
        >
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} value={field.value ?? ""} label="Titolo" fullWidth error={!!errors.title} helperText={errors.title?.message} />
                    )}
                />

                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            value={field.value ?? ""}
                            label="Descrizione"
                            fullWidth
                            multiline
                            minRows={3}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            sx={{ gridColumn: { md: "1 / -1" } }}
                        />
                    )}
                />

                <SelectInput<TicketDetailFormValues>
                    name="priority"
                    label="Priorità"
                    control={control}
                    options={priorityOptions}
                    error={errors.priority?.message}
                    renderOption={(id) => {
                        const { label, icon: Icon, color } = TICKET_PRIORITY_CONFIG[id as TicketPriority];
                        return (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Icon sx={{ color, fontSize: 18 }} />
                                {label}
                            </Box>
                        );
                    }}
                />

                <SelectInput<TicketDetailFormValues>
                    name="categoryId"
                    label="Categoria"
                    control={control}
                    options={categoryOptions}
                    error={errors.categoryId?.message}
                />

                <SearchInput<TicketDetailFormValues>
                    name="assignedToId"
                    label="Assegnato a"
                    control={control}
                    searchFn={searchUsers}
                    initialLabel={
                        ticket.assignedTo
                            ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                            : undefined
                    }
                />

                <SelectInput<TicketDetailFormValues>
                    name="status"
                    label="Stato"
                    control={control}
                    options={statusOptions}
                    error={errors.status?.message}
                    renderOption={(id) => {
                        const { label, icon: Icon, color } = TICKET_STATUS_CONFIG[id as TicketStatus];
                        return (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Icon sx={{ color, fontSize: 18 }} />
                                {label}
                            </Box>
                        );
                    }}
                />

                <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ gridColumn: { md: "1 / -1" } }}>
                    Salva
                </Button>
            </Box>
        </Box>
    );
}