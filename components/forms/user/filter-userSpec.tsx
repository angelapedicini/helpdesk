"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Box,
    Button,
    FormControlLabel,
    Checkbox,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useLazyQuery, useQuery } from "@apollo/client/react";

import { SEARCH_USERS } from "@/apollo-client/queries/user/search";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { AppSelect } from "../inputs/select-input";
import {
    SearchInput,
    SearchResult,
} from "../inputs/search-input";

import { useResetRegistry } from "../hooks/use-reset-registry";

import { FilterUserSpecInput, FilterUserSpecOutput, FilterUserSpecSchema } from "@/lib/validators/userSpec.schema";
import { ROLE_CONFIG } from "@/components/enums/role.config";
import { Role } from "@/lib/validators/enums.schema";
import { ME_QUERY } from "@/apollo-client/queries/user/me";


type FilterUserSpecFormProps = {
    onApply: (filter: FilterUserSpecOutput) => void;
    onReset?: () => void;
};

export default function FilterUserSpecForm({
    onApply,
    onReset,
}: FilterUserSpecFormProps) {
    const { registerReset, resetAll } = useResetRegistry();
      const { data: meData } = useQuery(ME_QUERY);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FilterUserSpecInput, unknown, FilterUserSpecOutput>({
        resolver: zodResolver(FilterUserSpecSchema),
    });

    const [searchUsers, { loading: loadingUsers }] =
        useLazyQuery(SEARCH_USERS);

    async function handleSearch(
        search: string
    ): Promise<SearchResult[]> {
        const { data } = await searchUsers({
            variables: {
                search,
                department: meData?.me?.department,
            },
        });

        return (data?.searchUsers ?? []).map((u) => ({
            id: u.id,
            label: `${u.firstName} ${u.lastName}`,
        }));
    }


    const { data } = useQuery(GET_CATEGORIES);

    const categoryOptions = (data?.categories ?? []).map((c) => ({
        id: c.id,
        label: c.name,
    }));

    const roleOptions = (
        Object.keys(ROLE_CONFIG) as Role[]
    ).map((id) => ({
        id,
        label: ROLE_CONFIG[id].label,
        icon: ROLE_CONFIG[id].icon,
        color: ROLE_CONFIG[id].color,
    }));


    const handleReset = () => {
        reset();
        resetAll();
        onReset?.();
    };


    function submit(values: FilterUserSpecOutput) {
        onApply(values);
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(submit)}
            noValidate
            sx={{
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >

                <AppSelect
                    name="categoryId"
                    label="Categoria"
                    control={control}
                    options={categoryOptions}
                />

                <SearchInput
                    name="userId"
                    label="Utente"
                    control={control}
                    onSearch={handleSearch}
                    loading={loadingUsers}
                    registerReset={registerReset}
                />

                <AppSelect
                    name="role"
                    label="Ruolo"
                    control={control}
                    options={roleOptions}
                />

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                    }}
                >
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={handleReset}
                        fullWidth
                    >
                        Reset
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        fullWidth
                    >
                        Applica
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}