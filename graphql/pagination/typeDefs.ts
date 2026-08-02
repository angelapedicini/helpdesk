// lib/graphql/connection-typedefs.ts
export function makeConnectionTypeDefs(typeName: string) {
  return `#graphql
    type ${typeName}Edge {
      node: ${typeName}!
      cursor: String!
    }

    type ${typeName}Connection {
      edges: [${typeName}Edge!]!
      pageInfo: PageInfo!
    }
  `;
}