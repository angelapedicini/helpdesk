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
    "\n  query Categories($department: Department) {\n    categories(department: $department) {\n      id\n      name\n      department\n    }\n  }\n": typeof types.CategoriesDocument,
    "\n  fragment TicketSnapshotFields on TicketSnapshot {\n    id\n    title\n    description\n    status\n    priority\n    category {\n      id\n      name\n      department\n    }\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    deletedAt\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n  }\n": typeof types.TicketSnapshotFieldsFragmentDoc,
    "\n  query GetTicketHistory($ticketId: Int!, $first: Int, $after: String) {\n    ticketHistory(ticketId: $ticketId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          ticketId\n          createdAt\n\n          snapshotBefore {\n            ...TicketSnapshotFields\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.GetTicketHistoryDocument,
    "\n  mutation CreateTicketMessage($input: TicketMessageInput!) {\n    createTicketMessage(input: $input) {\n      id\n      content\n      ticketId\n      createdAt\n      author {\n        id\n        firstName\n        lastName\n        role\n      }\n      ticket {\n        id\n        status\n        createdBy { id }\n        assignedTo { id }\n        category { id }\n        ticketDepartment\n      }\n    }\n  }\n": typeof types.CreateTicketMessageDocument,
    "\n  query GetTicketMessages($ticketId: Int!, $first: Int, $after: String) {\n    messages(ticketId: $ticketId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          content\n          createdAt\n          author {\n            id\n            firstName\n            lastName\n            role\n          }\n          ticket {\n            id\n            status\n            createdBy { id }\n            assignedTo { id }\n            category { id }\n            ticketDepartment\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.GetTicketMessagesDocument,
    "\n  mutation MarkTicketMessagesRead($ticketId: Int!) {\n    markTicketMessagesRead(ticketId: $ticketId) {\n      userId\n      ticketId\n      lastReadMessageId\n      lastReadMessage {\n        id\n        content\n        createdAt\n      }\n    }\n  }\n": typeof types.MarkTicketMessagesReadDocument,
    "\n  query UnreadTicketMessages {\n    unreadTicketMessages {\n      ticketId\n      count\n    }\n  }\n": typeof types.UnreadTicketMessagesDocument,
    "\n  fragment TicketFields on Ticket {\n    id\n    title\n    description\n    status\n    priority\n\n    category {\n      id\n      name\n      department\n    }\n\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n  }\n": typeof types.TicketFieldsFragmentDoc,
    "\n  mutation CreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      ...TicketFields\n    }\n  }\n": typeof types.CreateTicketDocument,
    "\n  mutation UpdateTicket($id: Int!, $input: TicketUpdateInput!) {\n    updateTicket(id: $id, input: $input) {\n      ...TicketFields\n    }\n  }\n": typeof types.UpdateTicketDocument,
    "\n  mutation DeleteTicket($id: Int!) {\n    deleteTicket(id: $id) {\n      id\n      deletedAt\n    }\n  }\n": typeof types.DeleteTicketDocument,
    "\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n    $scope: TicketScope\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter, scope: $scope) {\n      edges {\n        cursor\n        node {\n          ...TicketFields\n        }\n      }\n      pageInfo { hasNextPage endCursor }\n    }\n  }\n": typeof types.TicketsDocument,
    "\n  query GetTicketById($id: Int!) {\n    ticket(id: $id) {\n      ...TicketFields\n    }\n  }\n": typeof types.GetTicketByIdDocument,
    "\n  query SoleSpecialistCategoryIds($department: Department!, $userId: Int) {\n    soleSpecialistCategoryIds(department: $department, userId: $userId)\n  }\n\n  \n": typeof types.SoleSpecialistCategoryIdsDocument,
    "\n  mutation AddUserSpecialization($input: UserSpecInput!) {\n    addUserSpecialization(input: $input) {\n      id\n      user {\n        id\n        firstName\n        lastName\n      }\n      category {\n        id\n        name\n      }\n    }\n  }\n": typeof types.AddUserSpecializationDocument,
    "\n  mutation RemoveUserSpecialization($input: UserSpecInput!) {\n    removeUserSpecialization(input: $input)\n  }\n": typeof types.RemoveUserSpecializationDocument,
    "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n": typeof types.MeDocument,
    "\n  query SearchUsers($search: String, $role: Role, $department: Department) {\n    searchUsers(search: $search, role: $role, department: $department) {\n      id\n      firstName\n      lastName\n    }\n  }\n": typeof types.SearchUsersDocument,
    "\n query UsersByDepartment($userId: Int, $role: Role, $categoryId: Int) {\n    usersByDepartment(userId: $userId, role: $role, categoryId: $categoryId) {\n      id\n      firstName\n      lastName\n      role\n      specializations {\n        id\n        name\n        department\n      }\n    }\n  }\n": typeof types.UsersByDepartmentDocument,
};
const documents: Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Logout {\n    logout {\n      success\n    }\n  }\n": types.LogoutDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n": types.CreateUserDocument,
    "\n  query Categories($department: Department) {\n    categories(department: $department) {\n      id\n      name\n      department\n    }\n  }\n": types.CategoriesDocument,
    "\n  fragment TicketSnapshotFields on TicketSnapshot {\n    id\n    title\n    description\n    status\n    priority\n    category {\n      id\n      name\n      department\n    }\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    deletedAt\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n  }\n": types.TicketSnapshotFieldsFragmentDoc,
    "\n  query GetTicketHistory($ticketId: Int!, $first: Int, $after: String) {\n    ticketHistory(ticketId: $ticketId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          ticketId\n          createdAt\n\n          snapshotBefore {\n            ...TicketSnapshotFields\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.GetTicketHistoryDocument,
    "\n  mutation CreateTicketMessage($input: TicketMessageInput!) {\n    createTicketMessage(input: $input) {\n      id\n      content\n      ticketId\n      createdAt\n      author {\n        id\n        firstName\n        lastName\n        role\n      }\n      ticket {\n        id\n        status\n        createdBy { id }\n        assignedTo { id }\n        category { id }\n        ticketDepartment\n      }\n    }\n  }\n": types.CreateTicketMessageDocument,
    "\n  query GetTicketMessages($ticketId: Int!, $first: Int, $after: String) {\n    messages(ticketId: $ticketId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          content\n          createdAt\n          author {\n            id\n            firstName\n            lastName\n            role\n          }\n          ticket {\n            id\n            status\n            createdBy { id }\n            assignedTo { id }\n            category { id }\n            ticketDepartment\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.GetTicketMessagesDocument,
    "\n  mutation MarkTicketMessagesRead($ticketId: Int!) {\n    markTicketMessagesRead(ticketId: $ticketId) {\n      userId\n      ticketId\n      lastReadMessageId\n      lastReadMessage {\n        id\n        content\n        createdAt\n      }\n    }\n  }\n": types.MarkTicketMessagesReadDocument,
    "\n  query UnreadTicketMessages {\n    unreadTicketMessages {\n      ticketId\n      count\n    }\n  }\n": types.UnreadTicketMessagesDocument,
    "\n  fragment TicketFields on Ticket {\n    id\n    title\n    description\n    status\n    priority\n\n    category {\n      id\n      name\n      department\n    }\n\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n  }\n": types.TicketFieldsFragmentDoc,
    "\n  mutation CreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      ...TicketFields\n    }\n  }\n": types.CreateTicketDocument,
    "\n  mutation UpdateTicket($id: Int!, $input: TicketUpdateInput!) {\n    updateTicket(id: $id, input: $input) {\n      ...TicketFields\n    }\n  }\n": types.UpdateTicketDocument,
    "\n  mutation DeleteTicket($id: Int!) {\n    deleteTicket(id: $id) {\n      id\n      deletedAt\n    }\n  }\n": types.DeleteTicketDocument,
    "\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n    $scope: TicketScope\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter, scope: $scope) {\n      edges {\n        cursor\n        node {\n          ...TicketFields\n        }\n      }\n      pageInfo { hasNextPage endCursor }\n    }\n  }\n": types.TicketsDocument,
    "\n  query GetTicketById($id: Int!) {\n    ticket(id: $id) {\n      ...TicketFields\n    }\n  }\n": types.GetTicketByIdDocument,
    "\n  query SoleSpecialistCategoryIds($department: Department!, $userId: Int) {\n    soleSpecialistCategoryIds(department: $department, userId: $userId)\n  }\n\n  \n": types.SoleSpecialistCategoryIdsDocument,
    "\n  mutation AddUserSpecialization($input: UserSpecInput!) {\n    addUserSpecialization(input: $input) {\n      id\n      user {\n        id\n        firstName\n        lastName\n      }\n      category {\n        id\n        name\n      }\n    }\n  }\n": types.AddUserSpecializationDocument,
    "\n  mutation RemoveUserSpecialization($input: UserSpecInput!) {\n    removeUserSpecialization(input: $input)\n  }\n": types.RemoveUserSpecializationDocument,
    "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n": types.MeDocument,
    "\n  query SearchUsers($search: String, $role: Role, $department: Department) {\n    searchUsers(search: $search, role: $role, department: $department) {\n      id\n      firstName\n      lastName\n    }\n  }\n": types.SearchUsersDocument,
    "\n query UsersByDepartment($userId: Int, $role: Role, $categoryId: Int) {\n    usersByDepartment(userId: $userId, role: $role, categoryId: $categoryId) {\n      id\n      firstName\n      lastName\n      role\n      specializations {\n        id\n        name\n        department\n      }\n    }\n  }\n": types.UsersByDepartmentDocument,
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
export function graphql(source: "\n  query Categories($department: Department) {\n    categories(department: $department) {\n      id\n      name\n      department\n    }\n  }\n"): (typeof documents)["\n  query Categories($department: Department) {\n    categories(department: $department) {\n      id\n      name\n      department\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TicketSnapshotFields on TicketSnapshot {\n    id\n    title\n    description\n    status\n    priority\n    category {\n      id\n      name\n      department\n    }\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    deletedAt\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n  }\n"): (typeof documents)["\n  fragment TicketSnapshotFields on TicketSnapshot {\n    id\n    title\n    description\n    status\n    priority\n    category {\n      id\n      name\n      department\n    }\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    deletedAt\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTicketHistory($ticketId: Int!, $first: Int, $after: String) {\n    ticketHistory(ticketId: $ticketId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          ticketId\n          createdAt\n\n          snapshotBefore {\n            ...TicketSnapshotFields\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetTicketHistory($ticketId: Int!, $first: Int, $after: String) {\n    ticketHistory(ticketId: $ticketId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          ticketId\n          createdAt\n\n          snapshotBefore {\n            ...TicketSnapshotFields\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTicketMessage($input: TicketMessageInput!) {\n    createTicketMessage(input: $input) {\n      id\n      content\n      ticketId\n      createdAt\n      author {\n        id\n        firstName\n        lastName\n        role\n      }\n      ticket {\n        id\n        status\n        createdBy { id }\n        assignedTo { id }\n        category { id }\n        ticketDepartment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTicketMessage($input: TicketMessageInput!) {\n    createTicketMessage(input: $input) {\n      id\n      content\n      ticketId\n      createdAt\n      author {\n        id\n        firstName\n        lastName\n        role\n      }\n      ticket {\n        id\n        status\n        createdBy { id }\n        assignedTo { id }\n        category { id }\n        ticketDepartment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTicketMessages($ticketId: Int!, $first: Int, $after: String) {\n    messages(ticketId: $ticketId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          content\n          createdAt\n          author {\n            id\n            firstName\n            lastName\n            role\n          }\n          ticket {\n            id\n            status\n            createdBy { id }\n            assignedTo { id }\n            category { id }\n            ticketDepartment\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetTicketMessages($ticketId: Int!, $first: Int, $after: String) {\n    messages(ticketId: $ticketId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          content\n          createdAt\n          author {\n            id\n            firstName\n            lastName\n            role\n          }\n          ticket {\n            id\n            status\n            createdBy { id }\n            assignedTo { id }\n            category { id }\n            ticketDepartment\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkTicketMessagesRead($ticketId: Int!) {\n    markTicketMessagesRead(ticketId: $ticketId) {\n      userId\n      ticketId\n      lastReadMessageId\n      lastReadMessage {\n        id\n        content\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation MarkTicketMessagesRead($ticketId: Int!) {\n    markTicketMessagesRead(ticketId: $ticketId) {\n      userId\n      ticketId\n      lastReadMessageId\n      lastReadMessage {\n        id\n        content\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UnreadTicketMessages {\n    unreadTicketMessages {\n      ticketId\n      count\n    }\n  }\n"): (typeof documents)["\n  query UnreadTicketMessages {\n    unreadTicketMessages {\n      ticketId\n      count\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TicketFields on Ticket {\n    id\n    title\n    description\n    status\n    priority\n\n    category {\n      id\n      name\n      department\n    }\n\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n  }\n"): (typeof documents)["\n  fragment TicketFields on Ticket {\n    id\n    title\n    description\n    status\n    priority\n\n    category {\n      id\n      name\n      department\n    }\n\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      ...TicketFields\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      ...TicketFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTicket($id: Int!, $input: TicketUpdateInput!) {\n    updateTicket(id: $id, input: $input) {\n      ...TicketFields\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTicket($id: Int!, $input: TicketUpdateInput!) {\n    updateTicket(id: $id, input: $input) {\n      ...TicketFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteTicket($id: Int!) {\n    deleteTicket(id: $id) {\n      id\n      deletedAt\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteTicket($id: Int!) {\n    deleteTicket(id: $id) {\n      id\n      deletedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n    $scope: TicketScope\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter, scope: $scope) {\n      edges {\n        cursor\n        node {\n          ...TicketFields\n        }\n      }\n      pageInfo { hasNextPage endCursor }\n    }\n  }\n"): (typeof documents)["\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n    $scope: TicketScope\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter, scope: $scope) {\n      edges {\n        cursor\n        node {\n          ...TicketFields\n        }\n      }\n      pageInfo { hasNextPage endCursor }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTicketById($id: Int!) {\n    ticket(id: $id) {\n      ...TicketFields\n    }\n  }\n"): (typeof documents)["\n  query GetTicketById($id: Int!) {\n    ticket(id: $id) {\n      ...TicketFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SoleSpecialistCategoryIds($department: Department!, $userId: Int) {\n    soleSpecialistCategoryIds(department: $department, userId: $userId)\n  }\n\n  \n"): (typeof documents)["\n  query SoleSpecialistCategoryIds($department: Department!, $userId: Int) {\n    soleSpecialistCategoryIds(department: $department, userId: $userId)\n  }\n\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddUserSpecialization($input: UserSpecInput!) {\n    addUserSpecialization(input: $input) {\n      id\n      user {\n        id\n        firstName\n        lastName\n      }\n      category {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddUserSpecialization($input: UserSpecInput!) {\n    addUserSpecialization(input: $input) {\n      id\n      user {\n        id\n        firstName\n        lastName\n      }\n      category {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveUserSpecialization($input: UserSpecInput!) {\n    removeUserSpecialization(input: $input)\n  }\n"): (typeof documents)["\n  mutation RemoveUserSpecialization($input: UserSpecInput!) {\n    removeUserSpecialization(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchUsers($search: String, $role: Role, $department: Department) {\n    searchUsers(search: $search, role: $role, department: $department) {\n      id\n      firstName\n      lastName\n    }\n  }\n"): (typeof documents)["\n  query SearchUsers($search: String, $role: Role, $department: Department) {\n    searchUsers(search: $search, role: $role, department: $department) {\n      id\n      firstName\n      lastName\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n query UsersByDepartment($userId: Int, $role: Role, $categoryId: Int) {\n    usersByDepartment(userId: $userId, role: $role, categoryId: $categoryId) {\n      id\n      firstName\n      lastName\n      role\n      specializations {\n        id\n        name\n        department\n      }\n    }\n  }\n"): (typeof documents)["\n query UsersByDepartment($userId: Int, $role: Role, $categoryId: Int) {\n    usersByDepartment(userId: $userId, role: $role, categoryId: $categoryId) {\n      id\n      firstName\n      lastName\n      role\n      specializations {\n        id\n        name\n        department\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;