// // // lib/apollo-client/hooks/pagination-hook.ts
// // import { useState } from "react";
// // import { TypedDocumentNode, OperationVariables } from "@apollo/client";
// // import type { SortState } from "@/components/table";
// // import { useAppQuery } from "./query-hook";

// // type Connection<TNode> = {
// //     edges: { node: TNode; cursor: string }[];
// //     pageInfo: { hasNextPage: boolean; endCursor: string | null };
// // };

// // type DefaultVars<TSortField extends string> = OperationVariables & {
// //     first?: number;
// //     after?: string;
// //     orderBy?: { field: TSortField; direction: "ASC" | "DESC" };
// // };

// // export function useCursorPagination<
// //     TNode,
// //     TSortField extends string,
// //     TVars extends DefaultVars<TSortField> = DefaultVars<TSortField>
// // >(
// //     document: TypedDocumentNode<Record<string, Connection<TNode>>, TVars>,
// //     baseVariables?: Omit<TVars, "after" | "first" | "orderBy">,
// //     options?: { pageSize?: number; initialSort?: SortState<TSortField> }
// // ) {
// //     const pageSize = options?.pageSize ?? 20;
// //     const [sort, setSort] = useState<SortState<TSortField>>(options?.initialSort ?? null);

// //     const { data, loading, fetchMore, ...rest } = useAppQuery(document, {
// //         variables: {
// //             ...(baseVariables as TVars),
// //             first: pageSize,
// //             orderBy: sort ?? undefined,
// //         } as TVars,
// //         fetchPolicy: "network-only", // TEMPORANEO, solo per debug
// //     });

// //     const nodes = data?.edges.map((e) => e.node) ?? [];
// //     const hasNextPage = data?.pageInfo.hasNextPage ?? false;
// //     const endCursor = data?.pageInfo.endCursor;

// //     const loadMore = () => {
// //         if (!hasNextPage || !endCursor) return;
// //         fetchMore({
// //             variables: {
// //                 ...(baseVariables as TVars),
// //                 first: pageSize,
// //                 after: endCursor,
// //                 orderBy: sort ?? undefined,
// //             } as TVars,
// //         });
// //     };

// //     // Cambiare sort riparte da zero: nuova query, niente fetchMore col vecchio cursore
// //     const handleSortChange = (nextSort: SortState<TSortField>) => {
// //         setSort(nextSort);
// //     };

// //     return {
// //         nodes,
// //         loading,
// //         hasNextPage,
// //         loadMore,
// //         sort,
// //         setSort: handleSortChange,
// //         ...rest,
// //     };
// // }

// // lib/apollo-client/hooks/pagination-hook.ts
// import { useState } from "react";
// import { TypedDocumentNode, OperationVariables } from "@apollo/client";
// import type { SortState } from "@/components/table";
// import { useAppQuery } from "./query-hook";

// type Connection<TNode> = {
//     edges: { node: TNode; cursor: string }[];
//     pageInfo: { hasNextPage: boolean; endCursor: string | null };
// };

// type DefaultVars<TSortField extends string, TFilter> = OperationVariables & {
//     first?: number;
//     after?: string;
//     orderBy?: { field: TSortField; direction: "ASC" | "DESC" };
//     filter?: TFilter;
// };

// export function useCursorPagination<
//     TNode,
//     TSortField extends string,
//     TFilter extends Record<string, unknown> = Record<string, unknown>,
//     TVars extends DefaultVars<TSortField, TFilter> = DefaultVars<TSortField, TFilter>
// >(
//     document: TypedDocumentNode<Record<string, Connection<TNode>>, TVars>,
//     baseVariables?: Omit<TVars, "after" | "first" | "orderBy" | "filter">,
//     options?: {
//         pageSize?: number;
//         initialSort?: SortState<TSortField>;
//         initialFilter?: TFilter;
//     }
// ) {
//     const pageSize = options?.pageSize ?? 20;
//     const [sort, setSort] = useState<SortState<TSortField>>(options?.initialSort ?? null);
//     const [filter, setFilter] = useState<TFilter | undefined>(options?.initialFilter);

//     const { data, loading, fetchMore, ...rest } = useAppQuery(document, {
//         variables: {
//             ...(baseVariables as TVars),
//             first: pageSize,
//             orderBy: sort ?? undefined,
//             filter: filter ?? undefined,
//         } as TVars,
//         // fetchPolicy: "network-only", // TEMPORANEO, solo per debug
//         fetchPolicy: "cache-and-network",
//     });

//     const nodes = data?.edges.map((e) => e.node) ?? [];
//     const hasNextPage = data?.pageInfo.hasNextPage ?? false;
//     const endCursor = data?.pageInfo.endCursor;

//     const loadMore = () => {
//         if (!hasNextPage || !endCursor) return;
//         fetchMore({
//             variables: {
//                 ...(baseVariables as TVars),
//                 first: pageSize,
//                 after: endCursor,
//                 orderBy: sort ?? undefined,
//                 filter: filter ?? undefined,
//             } as TVars,
//         });
//     };

//     // Cambiare sort o filtro riparte da zero: nuova query, niente fetchMore col vecchio cursore
//     const handleSortChange = (nextSort: SortState<TSortField>) => {
//         setSort(nextSort);
//     };

//     const handleFilterChange = (nextFilter: TFilter | undefined) => {
//         setFilter(nextFilter);
//     };

//     // variabili "correnti" della query, utili per il refetch dopo una mutation
//     // (stessi valori che stiamo effettivamente usando per il fetch in questo momento)
//     const queryVariables = {
//         ...(baseVariables as TVars),
//         first: pageSize,
//         orderBy: sort ?? undefined,
//         filter: filter ?? undefined,
//     } as TVars;

//     return {
//         nodes,
//         loading,
//         hasNextPage,
//         loadMore,
//         sort,
//         setSort: handleSortChange,
//         filter,
//         setFilter: handleFilterChange,
//         queryVariables,
//         ...rest,
//     };
// }