// // lib/apollo-client/hooks/use-app-query.ts
// import { useQuery } from "@apollo/client/react";
// import type {
//     TypedDocumentNode,
//     OperationVariables,
//     WatchQueryFetchPolicy,
// } from "@apollo/client";

// // In Apollo Client 4 i tipi Options/Result non sono più export standalone,
// // ma namespace agganciati alla funzione: useQuery.Options / useQuery.Result
// type UseQueryOptionsAC<TData, TVars extends OperationVariables> =
//     typeof useQuery extends { Options: unknown }
//     ? never
//     : never; // placeholder, non usato

// const useQueryUnconditional = useQuery as
//     <TData,
//         TVars extends OperationVariables
//     >(
//         document: TypedDocumentNode<TData, TVars>,
//         options?: import("@apollo/client/react").useQuery.Options<TData, TVars>
//     ) => import("@apollo/client/react").useQuery.Result<TData, TVars>;

// type UseAppQueryOptions<TVars extends OperationVariables> = {
//     variables?: TVars;
//     skip?: boolean;
//     fetchPolicy?: WatchQueryFetchPolicy;
//     pollInterval?: number;
//     errorMessage?: string;
// };

// export function useAppQuery<
//     TData extends Record<string, unknown>,
//     TVars extends OperationVariables = OperationVariables
// >(
//     document: TypedDocumentNode<TData, TVars>,
//     options: UseAppQueryOptions<TVars> = {}
// ) {
//     const { variables, skip, fetchPolicy, pollInterval, errorMessage } = options;

//     const queryOptions = {
//         variables,
//         skip,
//         fetchPolicy,
//         pollInterval,
//         notifyOnNetworkStatusChange: true,
//         context: { errorMessage },
//     } as import("@apollo/client/react").useQuery.Options<TData, TVars>;

//     const { data, loading, error, refetch, fetchMore, networkStatus } =
//         useQueryUnconditional<TData, TVars>(document, queryOptions);

//     const typedData = data as TData | undefined;
//     const key = typedData ? (Object.keys(typedData)[0] as keyof TData) : undefined;
//     const result = key && typedData ? typedData[key] : undefined;

//     return {
//         data: result,
//         rawData: typedData,
//         loading,
//         error,
//         refetch,
//         fetchMore,
//         networkStatus,
//     };
// }