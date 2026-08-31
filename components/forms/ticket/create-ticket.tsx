"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import {
    CreateTicketFormOutput,
    CreateTicketFormValues,
    CreateTicketSchema,
} from "@/lib/validators/ticket-detail.schema";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { Role, type Department } from "@/apollo-client/gql/graphql";
import { skipToken, useMutation, useQuery } from "@apollo/client/react";
import { TicketPriority } from "@/lib/validators/enums.schema";
import { CREATE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";
import { AppSelect } from "../inputs/select-input";
import { useRouter } from "next/navigation";
// import { useAppQuery } from "@/apollo-client/hooks/query-hook";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import { SOLE_SPECIALIST_CATEGORY_IDS } from "@/apollo-client/queries/user-specialization/user-specialization.queries.ts";


type TicketDetailFormProps = {
    department?: Department;
    categoryId?: number;
    onSubmit: (values: CreateTicketFormOutput) => void | Promise<void>;
};

export default function CreateTicket({ categoryId, department, onSubmit }: TicketDetailFormProps) {
    const router = useRouter();
    const { data: meData } = useQuery(ME_QUERY);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateTicketFormValues, unknown, CreateTicketFormOutput>({
        resolver: zodResolver(CreateTicketSchema),
        defaultValues: {
            department,
        },
    });


    useEffect(() => {
        setValue("department", department as Department);
        setValue("categoryId", categoryId as number);
    }, [department, setValue]);

    const priorityOptions = (
        Object.keys(TICKET_PRIORITY_CONFIG) as TicketPriority[]
    ).map((id) => ({
        id,
        label: TICKET_PRIORITY_CONFIG[id].label,
        icon: TICKET_PRIORITY_CONFIG[id].icon,
        color: TICKET_PRIORITY_CONFIG[id].color,
    }));

    const canSeeSoleSpecialistHint =
        meData?.me?.role === "TECHNICIAN" && meData?.me.department === department;

    // Una sola chiamata per l'intero form, non una per ogni categoria selezionata.
    const { data: soleCategoriesData } = useQuery(
        SOLE_SPECIALIST_CATEGORY_IDS,
        canSeeSoleSpecialistHint && department
            ? { variables: { department } } // userId omesso → self, come concordato
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
        router.replace("/tickets");

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

                <AppSelect
                    name="priority"
                    label="Priorità"
                    control={control}
                    options={priorityOptions}
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



                {/* <AppSelect
                    name="categoryId"
                    label="Categoria"
                    control={control}
                    options={categoryOptions}
                    disabled={!department}
                /> */}

                {isSoleSpecialist && (
                    <Alert severity="info" sx={{ gridColumn: { md: "1 / -1" } }}>
                        Sei l'unico tecnico con questa specializzazione: il ticket ti
                        verrà assegnato automaticamente al momento della creazione.
                    </Alert>
                )}

                <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ gridColumn: { md: "1 / -1" } }}>
                    Salva
                </Button>
            </Box>
        </Box>
    );
}