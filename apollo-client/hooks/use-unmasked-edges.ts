// components/hooks/use-unmasked-edges.ts
import { useMemo } from "react";
import { useFragment } from "@/apollo-client/gql/fragment-masking";
import type { FragmentType } from "@/apollo-client/gql/fragment-masking";
import type { TypedDocumentNode } from "@apollo/client";

type Edge<TNode> = { node?: TNode | null | undefined } | null | undefined;

type Connection<TNode> = {
  edges?: Edge<TNode>[] | null;
} | null | undefined;

export function useUnmaskedEdges<TFragment, TMasked>(
  connection: Connection<TMasked>,
  fragmentDoc: TypedDocumentNode<TFragment, unknown>
): TFragment[] {
  return useMemo(() => {
    const edges = connection?.edges ?? [];
    return edges
      .filter((edge): edge is { node: TMasked } => !!edge?.node)
      .map((edge) => useFragment(fragmentDoc, edge.node as any) as TFragment);
  }, [connection, fragmentDoc]);
}