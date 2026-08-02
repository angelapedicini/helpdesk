// graphql/sorting/sorting.ts
export type SortDirection = "ASC" | "DESC";

export type SortArg<TField extends string> = {
  field: TField;
  direction: SortDirection;
};

/**
 * Costruisce un oggetto Prisma orderBy nidificato a partire da un path
 * tipo "category.name" -> { category: { name: "asc" } }
 */
function buildNestedOrderBy(path: string, direction: "asc" | "desc"): Record<string, any> {
  const parts = path.split(".");
  return parts.reduceRight<Record<string, any>>(
    (acc, key) => ({ [key]: acc }),
    direction as unknown as Record<string, any>
  );
}

export function toPrismaOrderBy<TField extends string, TOrderBy>(
  sort: SortArg<TField> | undefined | null,
  fieldMap: Record<TField, string>,
  fallback: TOrderBy
): TOrderBy | TOrderBy[] {
  if (!sort) return fallback;

  const direction = sort.direction === "ASC" ? "asc" : "desc";
  const path = fieldMap[sort.field];

  const primary = buildNestedOrderBy(path, direction) as TOrderBy;
  const tiebreaker = { id: direction } as unknown as TOrderBy;

  return [primary, tiebreaker];
}