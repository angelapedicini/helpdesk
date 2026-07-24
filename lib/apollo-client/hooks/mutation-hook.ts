// lib/apollo-client/hooks/use-app-mutation.ts
import { useMutation } from "@apollo/client/react";
import type { TypedDocumentNode, OperationVariables } from "@apollo/client";

type ListUpdateMode = "prepend" | "replace" | "remove";

export function useAppMutation<
  TData extends Record<string, unknown>,
  TVars extends OperationVariables,
  TListData extends Record<string, unknown[]> = Record<string, unknown[]>,
  TListVars extends OperationVariables = OperationVariables
>(
  document: TypedDocumentNode<TData, TVars>,
  successMessage?: string,
  listQuery?: TypedDocumentNode<TListData, TListVars>,
  mode: ListUpdateMode = "prepend"
) {
  const [mutate, { loading, error }] = useMutation(document, {
    context: { successMessage },
    update: listQuery
      ? (cache, result) => {
          const data = result.data;
          if (!data) return;

          const mutationKey = Object.keys(data)[0];
          const payload = data[mutationKey as keyof TData] as unknown;
          if (!payload) return;

          cache.updateQuery({ query: listQuery }, (existing) => {
            if (!existing) return existing;
            const listKey = Object.keys(existing)[0];
            const currentList = (existing as Record<string, unknown[]>)[
              listKey
            ] as { id: unknown }[];

            let updatedList: { id: unknown }[];

            if (mode === "prepend") {
              updatedList = [payload as { id: unknown }, ...currentList];
            } else if (mode === "replace") {
              const target = payload as { id: unknown };
              updatedList = currentList.map((item) =>
                item.id === target.id ? target : item
              );
            } else {
              const target = payload as { id: unknown };
              updatedList = currentList.filter((item) => item.id !== target.id);
            }

            return { ...existing, [listKey]: updatedList };
          });
        }
      : undefined,
  });

  const run = (vars: TVars) => mutate({ variables: vars });

  return { mutate: run, loading, error };
}