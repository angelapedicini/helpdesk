// lib/graphql/sort-typedefs.ts
export function makeSortTypeDefs(typeName: string, fields: string[]) {
  return `#graphql
    enum ${typeName}SortField {
      ${fields.join("\n      ")}
    }

    input ${typeName}OrderBy {
      field: ${typeName}SortField!
      direction: SortDirection!
    }
  `;
}