// components/hooks/use-cursor-pagination.ts
import { useCallback } from "react";
// import type { FetchMoreFunction } from "@apollo/client/react"; // o il tipo corretto della tua versione apollo

type PageInfo = {
  hasNextPage?: boolean | null;
  endCursor?: string | null;
} | null | undefined;

export function useCursorPagination(
  pageInfo: PageInfo,
  fetchMore: (options: { variables: { after: string } }) => Promise<unknown>
) {
  const hasNextPage = pageInfo?.hasNextPage ?? false;
  const endCursor = pageInfo?.endCursor ?? null;

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor) return;
    await fetchMore({ variables: { after: endCursor } });
  }, [hasNextPage, endCursor, fetchMore]);

  return { hasNextPage, endCursor, loadMore };
}