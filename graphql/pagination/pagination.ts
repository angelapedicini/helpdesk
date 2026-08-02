type CursorArgs = { first?: number; after?: string };

type PaginateOptions<TNode extends { id: number }> = {
  fetchPage: (params: {
    take: number;
    skip?: number;
    cursor?: { id: number };
  }) => Promise<TNode[]>;
  defaultPageSize?: number;
};

export async function paginateByCursor<TNode extends { id: number }>(
  args: CursorArgs,
  options: PaginateOptions<TNode>
) {
  const first = args.first ?? options.defaultPageSize ?? 20;
  const take = first + 1;

  const items = await options.fetchPage({
    take,
    ...(args.after ? { cursor: { id: Number(args.after) }, skip: 1 } : {}),
  });

  const hasNextPage = items.length > first;
  const nodes = hasNextPage ? items.slice(0, first) : items;

  return {
    edges: nodes.map((node) => ({ node, cursor: String(node.id) })),
    pageInfo: {
      hasNextPage,
      endCursor: nodes.length ? String(nodes[nodes.length - 1].id) : null,
    },
  };
}