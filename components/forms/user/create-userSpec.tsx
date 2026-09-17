"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, FormHelperText, TextField } from "@mui/material";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { type Department } from "@/graphql-generated/graphql";
import { useMutation, useQuery } from "@apollo/client/react";
import { AppSelect } from "../inputs/select-input";
import { CreateUserSpecInput, CreateUserSpecOutput, CreateUserSpecSchema } from "@/lib/validators/userSpec.schema";
import { ADD_USER_SPECIALIZATION } from "@/apollo-client/queries/user-specialization/user-specilization.mutation";

// stile campi di sola lettura: testo in primary invece del grigio sbiadito di default MUI
const readOnlyFieldSx = {
    "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "var(--mui-palette-primary-main)",
        color: "primary.main",
    },
};

type AddUserSpecializationFormProps = {
    userId: number;
    fullName: string;
    department?: Department;
    onSubmit: (values: CreateUserSpecOutput) => void | Promise<void>;
};

export default function AddUserSpecializationForm({
    userId,
    fullName,
    department,
    onSubmit,
}: AddUserSpecializationFormProps) {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateUserSpecInput, unknown, CreateUserSpecOutput>({
        resolver: zodResolver(CreateUserSpecSchema),
        defaultValues: { userId },
    });

    // userId arriva da fuori: lo teniamo sincronizzato nel form senza esporlo come campo visibile
    useEffect(() => {
        setValue("userId", userId);
    }, [userId, setValue]);

    const { data: categoriesData } = useQuery(GET_CATEGORIES, {
        variables: { department },
        skip: !department,
    });

    const categoryOptions = (categoriesData?.categories ?? []).map((c) => ({
        id: c.id,
        label: c.name,
    }));

    const [addUserSpecialization] = useMutation(ADD_USER_SPECIALIZATION, {
        context: {
            successMessage: "Specializzazione aggiunta con successo.",
        },
        refetchQueries: ["UsersManagement"],
        awaitRefetchQueries: true,
    });

    const handleFormSubmit = async (values: CreateUserSpecOutput) => {
        const result = await addUserSpecialization({
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
            sx={{ width: "100%", boxSizing: "border-box", }}
        >
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", }, gap: 3, mt: 2 }}>
                <TextField
                    label="Nome"
                    value={fullName}
                    disabled
                    fullWidth
                    sx={readOnlyFieldSx}
                />

                <AppSelect
                    name="categoryId"
                    label="Categoria"
                    control={control}
                    options={categoryOptions}
                    disabled={!department}
                />

                {errors.userId && (
                    <FormHelperText error sx={{ gridColumn: { md: "1 / -1" } }}>
                        {errors.userId.message}
                    </FormHelperText>
                )}

                {!department && (
                    <Alert severity="info" sx={{ gridColumn: { md: "1 / -1" } }}>
                        Seleziona un dipartimento per vedere le categorie disponibili.
                    </Alert>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{ gridColumn: { md: "1 / -1" } }}
                >
                    Salva
                </Button>
            </Box>
        </Box>
    );
}