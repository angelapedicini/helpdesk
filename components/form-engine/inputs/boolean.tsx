import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { FormControlLabel, Switch } from "@mui/material";

type Props<TInput extends FieldValues> = {
  name: Path<TInput>;
  label: string;
  control: Control<TInput>;
};

export function BooleanInput<TInput extends FieldValues>({
  name,
  label,
  control,
}: Props<TInput>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Switch
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          }
          label={label}
        />
      )}
    />
  );
}