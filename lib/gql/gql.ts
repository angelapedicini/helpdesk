/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Logout {\n    logout {\n      success\n    }\n  }\n": typeof types.LogoutDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  query Categories {\n    categories {\n      id\n      name\n      department\n    }\n  }\n": typeof types.CategoriesDocument,
    "\n  mutation CreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      id\n      title\n      description\n      status\n      category {\n        id\n        name\n        department\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n      }\n      assignedTo {\n        id\n        firstName\n        lastName\n      }\n      createdAt\n      updatedAt\n      closedAt\n    }\n  }\n": typeof types.CreateTicketDocument,
    "\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter) {\n      edges {\n        cursor\n        node {\n          id title description status\n          category { id name department }\n          createdBy { id firstName lastName }\n          assignedTo { id firstName lastName }\n          createdAt updatedAt closedAt\n        }\n      }\n      pageInfo { hasNextPage endCursor }\n    }\n  }\n": typeof types.TicketsDocument,
    "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n": typeof types.MeDocument,
    "\n  query SearchUsers($search: String) {\n    searchUsers(search: $search) {\n      id\n      firstName\n      lastName\n    }\n  }\n": typeof types.SearchUsersDocument,
};
const documents: Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Logout {\n    logout {\n      success\n    }\n  }\n": types.LogoutDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n": types.CreateUserDocument,
    "\n  query Categories {\n    categories {\n      id\n      name\n      department\n    }\n  }\n": types.CategoriesDocument,
    "\n  mutation CreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      id\n      title\n      description\n      status\n      category {\n        id\n        name\n        department\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n      }\n      assignedTo {\n        id\n        firstName\n        lastName\n      }\n      createdAt\n      updatedAt\n      closedAt\n    }\n  }\n": types.CreateTicketDocument,
    "\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter) {\n      edges {\n        cursor\n        node {\n          id title description status\n          category { id name department }\n          createdBy { id firstName lastName }\n          assignedTo { id firstName lastName }\n          createdAt updatedAt closedAt\n        }\n      }\n      pageInfo { hasNextPage endCursor }\n    }\n  }\n": types.TicketsDocument,
    "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n": types.MeDocument,
    "\n  query SearchUsers($search: String) {\n    searchUsers(search: $search) {\n      id\n      firstName\n      lastName\n    }\n  }\n": types.SearchUsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n"): (typeof documents)["\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Categories {\n    categories {\n      id\n      name\n      department\n    }\n  }\n"): (typeof documents)["\n  query Categories {\n    categories {\n      id\n      name\n      department\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      id\n      title\n      description\n      status\n      category {\n        id\n        name\n        department\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n      }\n      assignedTo {\n        id\n        firstName\n        lastName\n      }\n      createdAt\n      updatedAt\n      closedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      id\n      title\n      description\n      status\n      category {\n        id\n        name\n        department\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n      }\n      assignedTo {\n        id\n        firstName\n        lastName\n      }\n      createdAt\n      updatedAt\n      closedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter) {\n      edges {\n        cursor\n        node {\n          id title description status\n          category { id name department }\n          createdBy { id firstName lastName }\n          assignedTo { id firstName lastName }\n          createdAt updatedAt closedAt\n        }\n      }\n      pageInfo { hasNextPage endCursor }\n    }\n  }\n"): (typeof documents)["\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter) {\n      edges {\n        cursor\n        node {\n          id title description status\n          category { id name department }\n          createdBy { id firstName lastName }\n          assignedTo { id firstName lastName }\n          createdAt updatedAt closedAt\n        }\n      }\n      pageInfo { hasNextPage endCursor }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchUsers($search: String) {\n    searchUsers(search: $search) {\n      id\n      firstName\n      lastName\n    }\n  }\n"): (typeof documents)["\n  query SearchUsers($search: String) {\n    searchUsers(search: $search) {\n      id\n      firstName\n      lastName\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;