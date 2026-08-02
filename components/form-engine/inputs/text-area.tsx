import TextField from "@mui/material/TextField";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

type Props<TInput extends FieldValues> = {
  name: Path<TInput>;
  label: string;
  register: UseFormRegister<TInput>;
  error?: string;
  minRows?: number;
};

export function TextareaInput<TInput extends FieldValues>({
  name,
  label,
  register,
  error,
  minRows = 3,
}: Props<TInput>) {
  return (
    <TextField
      label={label}
      multiline
      minRows={minRows}
      {...register(name)}
      error={!!error}
      helperText={error}
    />
  );
}