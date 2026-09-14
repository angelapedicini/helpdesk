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

import { skipToken, useLazyQuery, useQuery } from "@apollo/client/react";

import { SEARCH_USERS } from "@/apollo-client/queries/user/search";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";

import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";

import {
    TicketPriority,
    TicketStatus,
} from "@/lib/validators/enums.schema";

import { AppSelect } from "../inputs/select-input";
import {
    SearchInput,
    SearchResult,
} from "../inputs/search-input";

import { useResetRegistry } from "../hooks/use-reset-registry";

import {
    FilterTicketInput,
    FilterTicketOutput,
    FilterTicketSchema,
} from "@/lib/validators/ticket-detail.schema";
import { toCalendarUTCDate, toPickerValue } from "@/lib/helper/formt-helpers";


type FilterTicketFormProps = {
    onApply: (filter: FilterTicketOutput) => void;
    onReset?: () => void;
    scope?: string;
    enabled?: boolean;
};

export default function FilterTicketForm({
    onApply,
    onReset,
    scope,
    enabled = true,
}: FilterTicketFormProps) {
    const { registerReset, resetAll } = useResetRegistry();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FilterTicketInput, unknown, FilterTicketOutput>({
        resolver: zodResolver(FilterTicketSchema),
    });

    const [searchUsers, { loading: loadingUsers }] =
        useLazyQuery(SEARCH_USERS);

    async function handleAssignedTo(
        search: string
    ): Promise<SearchResult[]> {
        const { data } = await searchUsers({
            variables: {
                search,
                role: "TECHNICIAN",
            },
        });

        return (data?.searchUsers ?? []).map((u) => ({
            id: u.id,
            label: `${u.firstName} ${u.lastName}`,
        }));
    }

    async function handleCreatedBy(
        search: string
    ): Promise<SearchResult[]> {
        const { data } = await searchUsers({
            variables: {
                search,
            },
        });

        return (data?.searchUsers ?? []).map((u) => ({
            id: u.id,
            label: `${u.firstName} ${u.lastName}`,
        }));
    }


    const { data } = useQuery(GET_CATEGORIES, {
        skip: !enabled,
    });

    const categoryOptions = (data?.categories ?? []).map((c) => ({
        id: c.id as number,
        label: c.name as string,
    }));

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

    const handleReset = () => {
        reset();
        resetAll();
        onReset?.();
    };

    function submit(values: FilterTicketOutput) {
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
                />

                <AppSelect
                    name="status"
                    label="Stato"
                    control={control}
                    options={statusOptions}
                />

                {scope !== "MINE" && (
                    <SearchInput
                        name="createdById"
                        label="Creato da"
                        control={control}
                        onSearch={handleCreatedBy}
                        loading={loadingUsers}
                        registerReset={registerReset}
                    />
                )}

                <SearchInput
                    name="assignedToId"
                    label="Assegnato a"
                    control={control}
                    onSearch={handleAssignedTo}
                    loading={loadingUsers}
                    registerReset={registerReset}
                />

                {/* FILTRI BOOLEANI */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Controller
                        name="overdue"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={field.value ?? false}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.checked
                                                    ? true
                                                    : undefined
                                            )
                                        }
                                    />
                                }
                                label="Solo ticket scaduti"
                            />
                        )}
                    />

                    <Controller
                        name="unassigned"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={field.value ?? false}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.checked
                                                    ? true
                                                    : undefined
                                            )
                                        }
                                    />
                                }
                                label="Solo ticket non assegnati"
                            />
                        )}
                    />
                </Box>

                {/* INTERVALLO DATA SCADENZA */}
                <Controller
                    name="dueDateFrom"
                    control={control}
                    render={({ field }) => (
                        <DatePicker
                            label="Scadenza da"
                            value={toPickerValue(field.value)}
                            onChange={(date) =>
                                field.onChange(
                                    toCalendarUTCDate(date)
                                )
                            }
                        // slotProps={{
                        //     textField: {
                        //         fullWidth: true,
                        //         error: !!errors.dueDateFrom,
                        //         helperText:
                        //             errors.dueDateFrom?.message,
                        //     },
                        // }}
                        />
                    )}
                />

                <Controller
                    name="dueDateTo"
                    control={control}
                    render={({ field }) => (
                        <DatePicker
                            label="Scadenza a"
                            value={toPickerValue(field.value)}
                            onChange={(date) =>
                                field.onChange(
                                    toCalendarUTCDate(date)
                                )
                            }
                        />
                    )}
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