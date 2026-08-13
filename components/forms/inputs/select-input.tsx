// components/forms/inputs/app-select.tsx

"use client";

import {
    Box,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    type SelectProps,
} from "@mui/material";

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
};

type AppSelectProps<
    TFieldValues extends FieldValues,
    TValue extends string | number = string | number,
> = {
    name: FieldPath<TFieldValues>;
    label: string;
    control: Control<TFieldValues>;
    options: SelectOption<TValue>[];
} & Omit<SelectProps, "name" | "value" | "defaultValue">;

export function AppSelect<
    TFieldValues extends FieldValues,
    TValue extends string | number = string | number,
>({
    name,
    label,
    control,
    options,
    ...selectProps
}: AppSelectProps<TFieldValues, TValue>) {
    const labelId = `${String(name)}-label`;

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <FormControl
                    fullWidth
                    error={!!fieldState.error}
                    disabled={selectProps.disabled}
                >
                    <InputLabel id={labelId}>
                        {label}
                    </InputLabel>

                    <Select
                        {...field}
                        {...selectProps}
                        labelId={labelId}
                        label={label}
                        value={field.value ?? ""}
                    >
                        {options.map((option) => {
                            const Icon = option.icon;

                            return (
                                <MenuItem
                                    key={option.id}
                                    value={option.id}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        {Icon && (
                                            <Icon
                                                sx={{
                                                    color: option.color,
                                                }}
                                            />
                                        )}

                                        {option.label}
                                    </Box>
                                </MenuItem>
                            );
                        })}
                    </Select>

                    <FormHelperText>
                        {fieldState.error?.message}
                    </FormHelperText>
                </FormControl>
            )}
        />
    );
}