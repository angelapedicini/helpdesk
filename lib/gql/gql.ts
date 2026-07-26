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
    "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n": typeof types.MeDocument,
};
const documents: Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Logout {\n    logout {\n      success\n    }\n  }\n": types.LogoutDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n": types.CreateUserDocument,
    "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n": types.MeDocument,
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
export function graphql(source: "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;