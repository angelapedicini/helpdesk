import { Control, FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import Box from "@mui/material/Box";
import { SelectInput } from "./inputs/select-input";
import { SearchInput } from "./inputs/search-input";
import { FieldDef } from "./fieldDefs";
import { TextInput } from "./inputs/text";
import { TextareaInput } from "./inputs/text-area";
import { NumberInput } from "./inputs/number";
import { BooleanInput } from "./inputs/boolean";
import { DateInput } from "./inputs/date";

type RenderContext<TInput extends FieldValues> = {
  control: Control<TInput>;
  register: UseFormRegister<TInput>;
  errors: FieldErrors<TInput>;
};

export function renderField<TInput extends FieldValues>(
  def: FieldDef,
  ctx: RenderContext<TInput>,
) {
  const name = def.name as Path<TInput>;
  const error = ctx.errors[name]?.message as string | undefined;

  switch (def.type) {
    case "text":
      return <TextInput name={name} label={def.label} register={ctx.register} error={error} />;

    case "textarea":
      return (
        <TextareaInput
          name={name}
          label={def.label}
          register={ctx.register}
          error={error}
          minRows={def.minRows}
        />
      );

    case "number":
      return <NumberInput name={name} label={def.label} register={ctx.register} error={error} />;

    case "boolean":
      return <BooleanInput name={name} label={def.label} control={ctx.control} />;

    case "date":
      return <DateInput name={name} label={def.label} control={ctx.control} />;

    case "select":
      return (
        <SelectInput
          name={name}
          label={def.label}
          control={ctx.control}
          options={def.options}
          renderOption={def.renderOption}
          error={error}
        />
      );

    case "search":
      return (
        <SearchInput
          name={name}
          label={def.label}
          labelName={def.labelName as Path<TInput>}
          control={ctx.control}
          searchFn={def.searchFn}
        />
      );

    default: {
      const _exhaustive: never = def;
      throw new Error(`Tipo di campo non gestito: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

export function FieldRenderer<TInput extends FieldValues>(
  props: { def: FieldDef } & RenderContext<TInput>,
) {
  const { def, ...ctx } = props;
  return <Box key={def.name}>{renderField(def, ctx)}</Box>;
}