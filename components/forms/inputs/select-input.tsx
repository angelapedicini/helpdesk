// components/forms/inputs/select-input.tsx
"use client";

import { Autocomplete, Box, TextField } from "@mui/material";
import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

export type SelectOption<TValue extends string | number = string | number> = {
    id: TValue;
    label: string;
    icon?: React.ComponentType<any>;
    color?: string;
    disabled?: boolean; // opzione mostrata ma non selezionabile (es. stato attuale)
};

type AppSelectProps<
    TFieldValues extends FieldValues,
    TValue extends string | number = string | number,
> = {
    name: FieldPath<TFieldValues>;
    label: string;
    control: Control<TFieldValues>;
    options: SelectOption<TValue>[];
    disabled?: boolean;
};

export function AppSelect<
    TFieldValues extends FieldValues,
    TValue extends string | number = string | number,
>({ name, label, control, options, disabled }: AppSelectProps<TFieldValues, TValue>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const selectedOption = options.find((o) => o.id === field.value) ?? null;
                const SelectedIcon = selectedOption?.icon;

                return (
                    <Autocomplete
                        disabled={disabled}
                        disableClearable
                        options={options}
                        getOptionDisabled={(option) => option.disabled === true}
                        getOptionLabel={(option) =>
                            typeof option === "object" ? option.label : ""
                        }
                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                        value={selectedOption as SelectOption<TValue>}
                        onChange={(_, selected) => field.onChange(selected?.id ?? null)}
                        onBlur={field.onBlur}
                        renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            const Icon = option.icon;
                            return (
                                <Box
                                    component="li"
                                    key={option.id}
                                    {...optionProps}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        opacity: option.disabled ? 0.5 : 1,
                                    }}
                                >
                                    {Icon && <Icon sx={{ color: option.color, fontSize: 20 }} />}
                                    {option.label}
                                </Box>
                            );
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={label}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                slotProps={{
                                    ...params.slotProps,
                                    input: {
                                        ...params.slotProps?.input,
                                        startAdornment: SelectedIcon ? (
                                            <SelectedIcon
                                                sx={{
                                                    color: selectedOption?.color,
                                                    fontSize: 20,
                                                    ml: 0.5,
                                                }}
                                            />
                                        ) : undefined,
                                    },
                                    htmlInput: {
                                        ...params.slotProps?.htmlInput,
                                        readOnly: true,
                                    },
                                }}
                                sx={{
                                    "& .MuiInputBase-input": {
                                        cursor: "pointer",
                                    },
                                }}
                            />
                        )}
                    />
                );
            }}
        />
    );
}