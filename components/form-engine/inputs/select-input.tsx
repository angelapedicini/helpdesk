// form-engine/inputs/select-input.tsx
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import type { ReactNode } from "react";
import { SelectOption } from "../fieldDefs";

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
      render={({ field }) => (
        <TextField
          label={label}
          select
          {...field}
          value={field.value ?? ""}
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
      )}
    />
  );
}