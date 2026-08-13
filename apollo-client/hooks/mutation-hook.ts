// // lib/apollo-client/hooks/use-app-mutation.ts
// import { useMutation } from "@apollo/client/react";
// import type { TypedDocumentNode, OperationVariables } from "@apollo/client";


// export function useAppMutation<
//   TData extends Record<string, unknown>,
//   TVars extends OperationVariables,
//   TListData extends Record<string, unknown> = Record<string, unknown>,
//   TListVars extends OperationVariables = OperationVariables
// >(
//   document: TypedDocumentNode<TData, TVars>,
//   successMessage?: string,
//   listQuery?: TypedDocumentNode<TListData, TListVars>,
//   listVariables?: TListVars
// ) {
//   const [mutate, { loading, error }] = useMutation(document, {
//     context: { successMessage }, // messaggio di default
//     refetchQueries: listQuery
//       ? [{ query: listQuery, variables: listVariables }]
//       : undefined,
//     awaitRefetchQueries: !!listQuery,
//   });

//   const run = (vars: TVars, overrideSuccessMessage?: string) =>
//     mutate({
//       variables: vars,
//       // se passato, sovrascrive il context di default (incluso successMessage)
//       context: overrideSuccessMessage
//         ? { successMessage: overrideSuccessMessage }
//         : undefined,
//     });

//   return { mutate: run, loading, error };
// }