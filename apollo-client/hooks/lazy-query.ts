import { useLazyQuery } from "@apollo/client/react";
import type { TypedDocumentNode, OperationVariables } from "@apollo/client";

const useLazyQueryUnconditional = useLazyQuery as <
  TData,
  TVars extends OperationVariables,
>(
  document: TypedDocumentNode<TData, TVars>,
  options?: import("@apollo/client/react").useLazyQuery.Options<TData, TVars>,
) => import("@apollo/client/react").useLazyQuery.ResultTuple<TData, TVars>;

type UseAppLazyQueryOptions = {
  errorMessage?: string;
};

export function useAppLazyQuery<
  TData extends Record<string, unknown>,
  TVars extends OperationVariables = OperationVariables,
>(document: TypedDocumentNode<TData, TVars>, options: UseAppLazyQueryOptions = {}) {
  const { errorMessage } = options;

  const lazyQueryOptions = {
    fetchPolicy: "network-only",
    context: { errorMessage },
  } as import("@apollo/client/react").useLazyQuery.Options<TData, TVars>;

  const [execute, { loading, error }] = useLazyQueryUnconditional<TData, TVars>(
    document,
    lazyQueryOptions,
  );

  const run = async (variables: TVars): Promise<TData[keyof TData] | undefined> => {
    const result = await execute({ variables });
    const typedData = result.data as TData | undefined;
    const key = typedData ? (Object.keys(typedData)[0] as keyof TData) : undefined;
    return key && typedData ? typedData[key] : undefined;
  };

  return { run, loading, error };
}