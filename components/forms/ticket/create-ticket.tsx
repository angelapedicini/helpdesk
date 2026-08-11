"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import {
    CreateTicketFormOutput,
    CreateTicketFormValues,
    CreateTicketSchema,
} from "@/lib/validators/ticket-detail.schema";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import type { Department } from "@/apollo-client/gql/graphql";
import { useMutation, useQuery } from "@apollo/client/react";
import { TicketPriority } from "@/lib/validators/enums.schema";
import { CREATE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";
import { SelectInput } from "../inputs/select-input";
import { AppSelect } from "../inputs/search-input2";

type TicketDetailFormProps = {
    department?: Department;
    onSubmit: (values: CreateTicketFormOutput) => void | Promise<void>;
};

export default function CreateTicket({ department, onSubmit }: TicketDetailFormProps) {
    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateTicketFormValues, unknown, CreateTicketFormOutput>({
        resolver: zodResolver(CreateTicketSchema),
        defaultValues: {
            department,
        },
    });

    // Il campo "department" non è editabile dall'utente:
    // arriva come prop e va sincronizzato nel form.
    useEffect(() => {
        setValue("department", department as Department);
    }, [department, setValue]);

    const { data } = useQuery(GET_CATEGORIES, {
        variables: { department },
        skip: !department,
    });

    const categoryOptions = (data?.categories ?? []).map((c) => ({
        id: c.id,
        label: c.name,
    }));

    const priorityOptions = (
        Object.keys(TICKET_PRIORITY_CONFIG) as TicketPriority[]
    ).map((id) => ({
        id,
        label: TICKET_PRIORITY_CONFIG[id].label,
        icon: TICKET_PRIORITY_CONFIG[id].icon,
        color: TICKET_PRIORITY_CONFIG[id].color,
    }));

    const [createTicket] = useMutation(CREATE_TICKET, {
        context: {
            successMessage: "Il ticket #{id} è stato creato con successo.",
        },
        update(cache) {
            cache.evict({ fieldName: "tickets" });
            cache.gc();
        },
    });

    const handleFormSubmit = async (
        values: CreateTicketFormOutput
    ) => {
        const result = await createTicket({
            variables: {
                input: values,
            },
        });

        if (result.error) {
            return;
        }

        onSubmit(values);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            sx={{ width: "100%", boxSizing: "border-box" }}
        >
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                <TextField
                    {...register("title")}
                    label="Titolo"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                />

                <TextField
                    {...register("description")}
                    label="Descrizione"
                    fullWidth
                    multiline
                    minRows={3}
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
                />

                <AppSelect
                    name="categoryId"
                    label="Categoria"
                    control={control}
                    options={categoryOptions}
                    disabled={!department}
                />

                <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ gridColumn: { md: "1 / -1" } }}>
                    Salva
                </Button>
            </Box>
        </Box>
    );
}