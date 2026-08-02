import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { toCalendarUTCDate, toPickerValue } from "@/lib/helper/formt-helpers";

type Props<TInput extends FieldValues> = {
  name: Path<TInput>;
  label: string;
  control: Control<TInput>;
};

export function DateInput<TInput extends FieldValues>({
  name,
  label,
  control,
}: Props<TInput>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          label={label}
          value={toPickerValue(field.value)}
          onChange={(date) => field.onChange(toCalendarUTCDate(date))}
          slotProps={{
            textField: {
              size: "small",
              error: !!fieldState.error,
              helperText: fieldState.error?.message,
            },
          }}
        />
      )}
    />
  );
}