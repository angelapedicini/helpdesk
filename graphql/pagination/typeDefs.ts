// lib/graphql/connection-typedefs.ts
export function makeConnectionTypeDefs(typeName: string) {
  return `#graphql
    type ${typeName}Edge {
      node: ${typeName}!
      cursor: String!
    }

    type ${typeName}Connection {
      # nullable: valorizzato solo dalle connection che passano "count"
      totalCount: Int
      edges: [${typeName}Edge!]!
      pageInfo: PageInfo!
    }
  `;
}