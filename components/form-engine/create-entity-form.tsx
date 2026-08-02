"use client";

import { useForm, Resolver, FieldValues, SubmitHandler, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { BaseItem, EntityFormConfig } from "./fieldDefs";
import { useAppMutation } from "@/lib/apollo-client/hooks/mutation-hook";
import { renderField } from "./field-render";


type Props<TInput extends FieldValues, TResponse extends BaseItem> = {
  config: EntityFormConfig<TInput, TResponse>;
  onCancel?: () => void;
  role?: string;
};

export default function CreateEntityForm<
  TInput extends FieldValues,
  TResponse extends BaseItem,
>({ config, onCancel, role }: Props<TInput, TResponse>) {
  const {
    handleSubmit,
    reset,
    control,
    register,
    formState: { errors },
  } = useForm<TInput, unknown, TInput>({
    resolver: zodResolver(config.schema) as Resolver<TInput>,
    defaultValues: config.defaultValues as DefaultValues<TInput>,
  });

  const create = useAppMutation(
    config.createMutation,
    config.successMessage,
    config.listQuery,
    config.listVariables,
  );

  const onSubmit: SubmitHandler<TInput> = async (data) => {
    const input = config.mapToMutationInput ? config.mapToMutationInput(data) : data;
    const result = await create.mutate({ input } as never);
    if (result.error) return;

    reset();
    onCancel?.();
  };

  const visibleFields = config.fields.filter(
    (f) => !f.onlyEdit && (!f.visibleFor || f.visibleFor(role)),
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 2 }}
    >
      {visibleFields.map((def) => (
        <Box key={def.name}>
          {renderField<TInput>(def, { control, register, errors })}
        </Box>
      ))}

      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={() => { reset(); onCancel?.(); }}>
          Annulla
        </Button>
        <Button type="submit" variant="contained" disabled={create.loading}>
          Crea
        </Button>
      </Box>
    </Box>
  );
}