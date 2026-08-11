// form-engine/inputs/select-input.tsx
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import type { ReactNode } from "react";

export type SelectOption = { id: string | number; label: string };

type Props<TInput extends FieldValues> = {
  name: Path<TInput>;
  label: string;
  control: Control<TInput>;
  options: SelectOption[];
  error?: string;
  renderOption?: (id: string | number) => ReactNode;
};

export function SelectInput<TInput extends FieldValues>({
  name,
  label,
  control,
  options,
  error,
  renderOption,
}: Props<TInput>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const hasMatch = options.some((opt) => opt.id === field.value);
        const selectValue = hasMatch ? field.value : "";

        return (
          <TextField
            label={label}
            select
            {...field}
            value={selectValue}
            error={!!error}
            helperText={error}
            slotProps={{
              select: {
                MenuProps: {
                  slotProps: {
                    paper: {
                      sx: { maxHeight: 300 },
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="">Seleziona {label.toLowerCase()}</MenuItem>
            {options.map(({ id, label: optLabel }) => (
              <MenuItem key={id} value={id}>
                {renderOption?.(id) ?? optLabel}
              </MenuItem>
            ))}
          </TextField>
        );
      }}
    />
  );
}