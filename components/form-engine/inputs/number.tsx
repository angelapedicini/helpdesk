import TextField from "@mui/material/TextField";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

type Props<TInput extends FieldValues> = {
  name: Path<TInput>;
  label: string;
  register: UseFormRegister<TInput>;
  error?: string;
};

export function NumberInput<TInput extends FieldValues>({
  name,
  label,
  register,
  error,
}: Props<TInput>) {
  return (
    <TextField
      label={label}
      type="number"
      {...register(name)}
      slotProps={{ htmlInput: { step: "0.01" } }}
      error={!!error}
      helperText={error}
    />
  );
}