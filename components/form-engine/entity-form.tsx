"use client";

import { FieldValues } from "react-hook-form";
import { BaseItem, EntityFormConfig } from "./fieldDefs";
import CreateEntityForm from "./create-entity-form";
import UpdateEntityForm from "./update-entity-form";


type Props<TInput extends FieldValues, TResponse extends BaseItem> = {
  config: EntityFormConfig<TInput, TResponse>;
  onCancel?: () => void;
  initialData?: TResponse;
  role?: string;
};

export default function EntityForm<
  TInput extends FieldValues,
  TResponse extends BaseItem,
>({ config, onCancel, initialData, role }: Props<TInput, TResponse>) {
  if (initialData) {
    if (!config.updateMutation) {
      console.error("updateMutation mancante per questo form in edit mode");
      return null;
    }
    return (
      <UpdateEntityForm
        config={config as EntityFormConfig<TInput, TResponse> & {
          updateMutation: NonNullable<EntityFormConfig<TInput, TResponse>["updateMutation"]>;
        }}
        initialData={initialData}
        onCancel={onCancel}
        role={role}
      />
    );
  }

  return <CreateEntityForm config={config} onCancel={onCancel} role={role} />;
}