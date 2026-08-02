import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues } from "react-hook-form";
import type { ReactNode } from "react";
import type { TypedDocumentNode, OperationVariables } from "@apollo/client";

export type BaseItem = { id: number };

type ZodResolverSchema = Parameters<typeof zodResolver>[0];

export type SelectOption = { id: string | number; label: string };
export type SearchResult = { id: number; label: string };

export type FieldDef =
  | {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "boolean";
    onlyEdit?: boolean;
    visibleFor?: (role?: string) => boolean;
  }
  | {
    name: string;
    label: string;
    type: "textarea";
    minRows?: number;
    onlyEdit?: boolean;
    visibleFor?: (role?: string) => boolean;
  }
  | {
    name: string;
    label: string;
    type: "select";
    options: SelectOption[];
    onlyEdit?: boolean;
    visibleFor?: (role?: string) => boolean;
    renderOption?: (id: string | number) => ReactNode;
  }
  | {
    name: string;
    label: string;
    type: "search";
    searchFn: (filter: { search?: string }) => Promise<SearchResult[]>;
    initialLabel?: string;
    onlyEdit?: boolean;
    visibleFor?: (role?: string) => boolean;
  }

export type EntityFormConfig<
  TInput extends FieldValues,
  TResponse extends BaseItem,
  TCreateData extends Record<string, unknown> = Record<string, unknown>,
  TUpdateData extends Record<string, unknown> = Record<string, unknown>,
  TListData extends Record<string, unknown> = Record<string, unknown>,
  TListVars extends OperationVariables = OperationVariables,
> = {
  schema: ZodResolverSchema;
  defaultValues: TInput;
  mapToForm: (data: TResponse) => TInput;
  fields: FieldDef[];

  createMutation: TypedDocumentNode<TCreateData, { input: TInput }>;
  updateMutation?: TypedDocumentNode<TUpdateData, { id: TResponse["id"]; input: TInput }>;

  mapToMutationInput?: (formData: TInput) => TInput;

  successMessage?: string;

  listQuery?: TypedDocumentNode<TListData, TListVars>;
  listVariables?: TListVars;
};

export type FilterFormConfig<TInput extends FieldValues> = {
  schema: ZodResolverSchema;
  defaultValues: TInput;
  fields: FieldDef[];
};