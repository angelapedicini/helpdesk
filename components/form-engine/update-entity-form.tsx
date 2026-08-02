"use client";

import { useForm, Resolver, FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { BaseItem, EntityFormConfig } from "./fieldDefs";
import { useAppMutation } from "@/lib/apollo-client/hooks/mutation-hook";
import { renderField } from "./field-render";


type ConfigWithUpdate<TInput extends FieldValues, TResponse extends BaseItem> =
  EntityFormConfig<TInput, TResponse> & {
    updateMutation: NonNullable<EntityFormConfig<TInput, TResponse>["updateMutation"]>;
  };

type Props<TInput extends FieldValues, TResponse extends BaseItem> = {
  config: ConfigWithUpdate<TInput, TResponse>;
  initialData: TResponse;
  onCancel?: () => void;
  role?: string;
};

export default function UpdateEntityForm<
  TInput extends FieldValues,
  TResponse extends BaseItem,
>({ config, initialData, onCancel, role }: Props<TInput, TResponse>) {
  const {
    handleSubmit,
    reset,
    control,
    register,
    formState: { errors, isDirty },
  } = useForm<TInput, unknown, TInput>({
    resolver: zodResolver(config.schema) as Resolver<TInput>,
    values: config.mapToForm(initialData),
  });

  const update = useAppMutation(
    config.updateMutation,
    config.successMessage,
    config.listQuery,
    config.listVariables,
  );

  const onSubmit: SubmitHandler<TInput> = async (data) => {
    if (!isDirty) {
      onCancel?.();
      return;
    }

    const result = await update.mutate({ id: initialData.id, input: data } as never);
    if (result.error) return; // errore già notificato dal notificationLink

    reset();
    onCancel?.();
  };

  const visibleFields = config.fields.filter((f) => !f.visibleFor || f.visibleFor(role));

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
        <Button type="submit" variant="contained" disabled={update.loading}>
          Salva modifiche
        </Button>
      </Box>
    </Box>
  );
}