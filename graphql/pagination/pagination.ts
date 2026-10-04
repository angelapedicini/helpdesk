type CursorArgs = { first?: number; after?: string };

type PaginateOptions<TNode extends { id: number }> = {
  fetchPage: (params: {
    take: number;
    skip?: number;
    cursor?: { id: number };
  }) => Promise<TNode[]>;
  // OPZIONALE: se non lo passi, totalCount resta null e non viene fatta
  // nessuna query di conteggio. Le connection esistenti non cambiano.
  count?: () => Promise<number>;
  defaultPageSize?: number;
};

export async function paginateByCursor<TNode extends { id: number }>(
  args: CursorArgs,
  options: PaginateOptions<TNode>
) {
  const first = args.first ?? options.defaultPageSize ?? 20;
  const take = first + 1;

  const [items, totalCount] = await Promise.all([
    options.fetchPage({
      take,
      ...(args.after ? { cursor: { id: Number(args.after) }, skip: 1 } : {}),
    }),
    options.count ? options.count() : Promise.resolve(null),
  ]);

  const hasNextPage = items.length > first;
  const nodes = hasNextPage ? items.slice(0, first) : items;

  return {
    totalCount,
    edges: nodes.map((node) => ({ node, cursor: String(node.id) })),
    pageInfo: {
      hasNextPage,
      endCursor: nodes.length ? String(nodes[nodes.length - 1].id) : null,
    },
  };
}