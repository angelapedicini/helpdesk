import TextField from "@mui/material/TextField";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

type Props<TInput extends FieldValues> = {
  name: Path<TInput>;
  label: string;
  register: UseFormRegister<TInput>;
  error?: string;
};

export function TextInput<TInput extends FieldValues>({
  name,
  label,
  register,
  error,
}: Props<TInput>) {
  return (
    <TextField
      label={label}
      {...register(name)}
      error={!!error}
      helperText={error}
    />
  );
}