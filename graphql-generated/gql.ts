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
    "\n  query GetDashboard {\n    dashboard {\n      counterGroups {\n        scope\n        alerts {\n          firstResponseOverdue\n          dueDateOverdue\n          reopened\n          firstResponseDueSoon\n          dueDateDueSoon\n        }\n      }\n      ticketLists {\n        list\n        tickets {\n          id\n          title\n          status\n          createdAt\n          dueDate\n        }\n      }\n    }\n  }\n": typeof types.GetDashboardDocument,
    "\n  mutation StartDemo {\n    startDemo {\n      success\n      demoSessionId\n    }\n  }\n": typeof types.StartDemoDocument,
    "\n  query TicketStatsByDepartment {\n    ticketStatsByDepartment {\n      department\n      total\n      open\n      assigned\n      inProgress\n      closed\n      refused\n      firstResponseLate\n      dueDateLate\n      closedOnTime\n      openAssignedLate\n      average\n    }\n  }\n": typeof types.TicketStatsByDepartmentDocument,
    "\n  query TicketStatsByTechnician {\n    ticketStatsByTechnician {\n      technicianId\n      label\n      total\n      open\n      assigned\n      inProgress\n      closed\n      refused\n      firstResponseLate\n      dueDateLate\n      average\n    }\n  }\n": typeof types.TicketStatsByTechnicianDocument,
    "\n  mutation CreateTicketNotificationSubscription($ticketId: Int!) {\n    createTicketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n": typeof types.CreateTicketNotificationSubscriptionDocument,
    "\n  mutation DeleteTicketNotificationSubscription($ticketId: Int!) {\n    deleteTicketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n": typeof types.DeleteTicketNotificationSubscriptionDocument,
    "\n  query TicketNotificationSubscription($ticketId: Int!) {\n    ticketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n": typeof types.TicketNotificationSubscriptionDocument,
    "\n  mutation CreateTicketCategory($input: CreateTicketCategoryInput!) {\n    createTicketCategory(input: $input) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": typeof types.CreateTicketCategoryDocument,
    "\n  mutation UpdateCategory($id: Int!, $input: UpdateCategoryInput!) {\n    updateCategory(id: $id, input: $input) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": typeof types.UpdateCategoryDocument,
    "\n  mutation DeleteTicketCategory($id: Int!) {\n    deleteTicketCategory(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": typeof types.DeleteTicketCategoryDocument,
    "\n  mutation RestoreTicketCategory($id: Int!) {\n    restoreTicketCategory(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": typeof types.RestoreTicketCategoryDocument,
    "\n  query Categories($department: Department, $includeDisabled: Boolean) {\n    categories(department: $department, includeDisabled: $includeDisabled) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": typeof types.CategoriesDocument,
    "\n  query CategoryById($id: Int!) {\n    categoryById(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": typeof types.CategoryByIdDocument,
    "\n  query CategoryAccesses($categoryId: Int) {\n    categoryAccesses(categoryId: $categoryId) {\n      id\n      categoryId\n      disabled\n      requesterDepartment\n      requesterMinRole\n    }\n  }\n": typeof types.CategoryAccessesDocument,
    "\n  fragment TicketHistoryFields on TicketHistory {\n    id\n    originalTicketId\n    title\n    description\n    status\n    priority\n    dueDate\n    dueFirstResponse\n    reopenCount\n    reopenReason\n    sourceDepartmentForUser\n    category {\n      id\n      name\n    }\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n    createdAt\n    updatedAt\n    closedAt\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n    ticketSpecific\n    deletedAt\n    deletedBy {\n      id\n      firstName\n      lastName\n    }\n  }\n": typeof types.TicketHistoryFieldsFragmentDoc,
    "\n  query TicketHistoryByTicketId(\n    $ticketId: Int!\n    $first: Int\n    $after: String\n    $filter: TicketHistoryFilter\n  ) {\n    ticketHistoryByTicketId(\n      ticketId: $ticketId\n      first: $first\n      after: $after\n      filter: $filter\n    ) {\n      edges {\n        cursor\n        node {\n          ...TicketHistoryFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.TicketHistoryByTicketIdDocument,
    "\n  query DeletedTickets(\n    $first: Int\n    $after: String\n    $filter: TicketHistoryFilter\n    $scope: TicketScope\n  ) {\n    deletedTickets(\n      first: $first\n      after: $after\n      filter: $filter\n      scope: $scope\n    ) {\n      edges {\n        cursor\n        node {\n          ...TicketHistoryFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.DeletedTicketsDocument,
    "\n  mutation CreateTicketMessage($input: TicketMessageInput!) {\n    createTicketMessage(input: $input) {\n      id\n      content\n      ticketId\n      createdAt\n      author {\n        id\n        firstName\n        lastName\n        role\n      }\n      ticket {\n        id\n        status\n        createdBy { id }\n        assignedTo { id }\n        category { id }\n        ticketDepartment\n      }\n    }\n  }\n": typeof types.CreateTicketMessageDocument,
    "\n  query GetTicketMessages($ticketId: Int!, $first: Int, $after: String) {\n    messages(ticketId: $ticketId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          content\n          createdAt\n          author {\n            id\n            firstName\n            lastName\n            role\n          }\n          ticket {\n            id\n            status\n            createdBy { id }\n            assignedTo { id }\n            category { id }\n            ticketDepartment\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.GetTicketMessagesDocument,
    "\n  mutation ClearTicketNotifications($ticketId: Int!) {\n    clearTicketNotifications(ticketId: $ticketId)\n  }\n": typeof types.ClearTicketNotificationsDocument,
    "\n  query NavNotifications {\n    unreadTicketMessages {\n      ticketId\n      count\n      lastMessageAt\n    }\n    ticketNotifications {\n      id\n      type\n      updatedAt\n      ticket {\n        id\n        title\n      }\n    }\n  }\n": typeof types.NavNotificationsDocument,
    "\n  mutation MarkTicketMessagesRead($ticketId: Int!) {\n    markTicketMessagesRead(ticketId: $ticketId) {\n      userId\n      ticketId\n      lastReadMessageId\n      lastReadMessage {\n        id\n        content\n        createdAt\n      }\n    }\n  }\n": typeof types.MarkTicketMessagesReadDocument,
    "\n  query UnreadTicketMessages {\n    unreadTicketMessages {\n      ticketId\n      count\n    }\n  }\n": typeof types.UnreadTicketMessagesDocument,
    "\n fragment TicketFields on Ticket {\n    id\n    title\n    description\n    status\n    priority\n\n    specificData {\n      __typename\n      ... on TicketITSpecific {\n        hardwareType\n        software\n      }\n      ... on TicketHRSpecific {\n        payrollReference\n      }\n      ... on TicketFinanceSpecific {\n        customer\n        invoiceReference\n        budgetType\n      }\n      ... on TicketSupportSpecific {\n        customer\n      }\n      ... on TicketLogisticSpecific {\n        customer\n        shipmentReference\n      }\n    }\n\n    category {\n      id\n      name\n      department\n      specificField\n    }\n\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    dueFirstResponse\n    reopenCount\n    reopenReason\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n      role\n    }\n    closingMessage\n}\n": typeof types.TicketFieldsFragmentDoc,
    "\n  mutation CreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      ...TicketFields\n    }\n  }\n": typeof types.CreateTicketDocument,
    "\n  mutation UpdateTicket($id: Int!, $input: TicketUpdateInput!) {\n    updateTicket(id: $id, input: $input) {\n      ...TicketFields\n    }\n  }\n": typeof types.UpdateTicketDocument,
    "\n  mutation DeleteTicket($id: Int!) {\n    deleteTicket(id: $id) {\n      ...TicketFields\n    }\n  }\n": typeof types.DeleteTicketDocument,
    "\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n    $scope: TicketScope\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter, scope: $scope) {\n  totalCount\n  edges {\n    cursor\n    node {\n      ...TicketFields\n    }\n  }\n  pageInfo { hasNextPage endCursor }\n   }\n  }\n": typeof types.TicketsDocument,
    "\n  query GetTicketById($id: Int!) {\n    ticket(id: $id) {\n      ...TicketFields\n    }\n  }\n": typeof types.GetTicketByIdDocument,
    "\n  query TicketAlerts($scope: TicketScope) {\n    ticketAlerts(scope: $scope) {\n      firstResponseOverdue\n      dueDateOverdue\n      reopened\n      firstResponseDueSoon\n      dueDateDueSoon\n    }\n  }\n": typeof types.TicketAlertsDocument,
    "\n  query SoleSpecialistCategoryIds($department: Department!, $userId: Int) {\n    soleSpecialistCategoryIds(department: $department, userId: $userId)\n  } \n": typeof types.SoleSpecialistCategoryIdsDocument,
    "\n  query usersForCategoryId($categoryId: Int!, $search: String) {\n    usersForCategoryId(categoryId: $categoryId, search: $search) {\n      id\n      firstName\n      lastName\n    }\n  }\n": typeof types.UsersForCategoryIdDocument,
    "\n  mutation AddUserSpecialization($input: UserSpecInput!) {\n    addUserSpecialization(input: $input) {\n      id\n      user {\n        id\n        firstName\n        lastName\n      }\n      category {\n        id\n        name\n      }\n    }\n  }\n": typeof types.AddUserSpecializationDocument,
    "\n  mutation RemoveUserSpecialization($input: UserSpecInput!) {\n    removeUserSpecialization(input: $input)\n  }\n": typeof types.RemoveUserSpecializationDocument,
    "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n": typeof types.MeDocument,
    "\n  query SearchUsers($search: String, $role: Role, $department: Department, $categoryId: Int, $restrictToDepartment: Boolean) {\n    searchUsers(search: $search, role: $role, department: $department, categoryId: $categoryId, restrictToDepartment: $restrictToDepartment) {\n      id\n      firstName\n      lastName\n    }\n  }\n": typeof types.SearchUsersDocument,
    "\n  query UsersManagement($search: String, $userId: Int, $role: Role, $department: Department, $categoryId: Int) {\n    usersForManagement(search: $search, userId: $userId, role: $role, department: $department, categoryId: $categoryId) {\n      id\n      firstName\n      lastName\n      role\n      department\n      specializations {\n        id\n        name\n        department\n      }\n    }\n  }\n": typeof types.UsersManagementDocument,
    "\n  query UsersByDepForLogin($department: Department!) {\n    usersByDepForLogin(department: $department) {\n      id\n      firstName\n      lastName\n      email\n      role\n    }\n  }\n": typeof types.UsersByDepForLoginDocument,
    "\n  mutation UpdateUserRole($input: UpdateUserRoleInput!) {\n    updateUserRole(input: $input) {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n": typeof types.UpdateUserRoleDocument,
};
const documents: Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Logout {\n    logout {\n      success\n    }\n  }\n": types.LogoutDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n": types.CreateUserDocument,
    "\n  query GetDashboard {\n    dashboard {\n      counterGroups {\n        scope\n        alerts {\n          firstResponseOverdue\n          dueDateOverdue\n          reopened\n          firstResponseDueSoon\n          dueDateDueSoon\n        }\n      }\n      ticketLists {\n        list\n        tickets {\n          id\n          title\n          status\n          createdAt\n          dueDate\n        }\n      }\n    }\n  }\n": types.GetDashboardDocument,
    "\n  mutation StartDemo {\n    startDemo {\n      success\n      demoSessionId\n    }\n  }\n": types.StartDemoDocument,
    "\n  query TicketStatsByDepartment {\n    ticketStatsByDepartment {\n      department\n      total\n      open\n      assigned\n      inProgress\n      closed\n      refused\n      firstResponseLate\n      dueDateLate\n      closedOnTime\n      openAssignedLate\n      average\n    }\n  }\n": types.TicketStatsByDepartmentDocument,
    "\n  query TicketStatsByTechnician {\n    ticketStatsByTechnician {\n      technicianId\n      label\n      total\n      open\n      assigned\n      inProgress\n      closed\n      refused\n      firstResponseLate\n      dueDateLate\n      average\n    }\n  }\n": types.TicketStatsByTechnicianDocument,
    "\n  mutation CreateTicketNotificationSubscription($ticketId: Int!) {\n    createTicketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n": types.CreateTicketNotificationSubscriptionDocument,
    "\n  mutation DeleteTicketNotificationSubscription($ticketId: Int!) {\n    deleteTicketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n": types.DeleteTicketNotificationSubscriptionDocument,
    "\n  query TicketNotificationSubscription($ticketId: Int!) {\n    ticketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n": types.TicketNotificationSubscriptionDocument,
    "\n  mutation CreateTicketCategory($input: CreateTicketCategoryInput!) {\n    createTicketCategory(input: $input) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": types.CreateTicketCategoryDocument,
    "\n  mutation UpdateCategory($id: Int!, $input: UpdateCategoryInput!) {\n    updateCategory(id: $id, input: $input) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": types.UpdateCategoryDocument,
    "\n  mutation DeleteTicketCategory($id: Int!) {\n    deleteTicketCategory(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": types.DeleteTicketCategoryDocument,
    "\n  mutation RestoreTicketCategory($id: Int!) {\n    restoreTicketCategory(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": types.RestoreTicketCategoryDocument,
    "\n  query Categories($department: Department, $includeDisabled: Boolean) {\n    categories(department: $department, includeDisabled: $includeDisabled) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": types.CategoriesDocument,
    "\n  query CategoryById($id: Int!) {\n    categoryById(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n": types.CategoryByIdDocument,
    "\n  query CategoryAccesses($categoryId: Int) {\n    categoryAccesses(categoryId: $categoryId) {\n      id\n      categoryId\n      disabled\n      requesterDepartment\n      requesterMinRole\n    }\n  }\n": types.CategoryAccessesDocument,
    "\n  fragment TicketHistoryFields on TicketHistory {\n    id\n    originalTicketId\n    title\n    description\n    status\n    priority\n    dueDate\n    dueFirstResponse\n    reopenCount\n    reopenReason\n    sourceDepartmentForUser\n    category {\n      id\n      name\n    }\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n    createdAt\n    updatedAt\n    closedAt\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n    ticketSpecific\n    deletedAt\n    deletedBy {\n      id\n      firstName\n      lastName\n    }\n  }\n": types.TicketHistoryFieldsFragmentDoc,
    "\n  query TicketHistoryByTicketId(\n    $ticketId: Int!\n    $first: Int\n    $after: String\n    $filter: TicketHistoryFilter\n  ) {\n    ticketHistoryByTicketId(\n      ticketId: $ticketId\n      first: $first\n      after: $after\n      filter: $filter\n    ) {\n      edges {\n        cursor\n        node {\n          ...TicketHistoryFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.TicketHistoryByTicketIdDocument,
    "\n  query DeletedTickets(\n    $first: Int\n    $after: String\n    $filter: TicketHistoryFilter\n    $scope: TicketScope\n  ) {\n    deletedTickets(\n      first: $first\n      after: $after\n      filter: $filter\n      scope: $scope\n    ) {\n      edges {\n        cursor\n        node {\n          ...TicketHistoryFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.DeletedTicketsDocument,
    "\n  mutation CreateTicketMessage($input: TicketMessageInput!) {\n    createTicketMessage(input: $input) {\n      id\n      content\n      ticketId\n      createdAt\n      author {\n        id\n        firstName\n        lastName\n        role\n      }\n      ticket {\n        id\n        status\n        createdBy { id }\n        assignedTo { id }\n        category { id }\n        ticketDepartment\n      }\n    }\n  }\n": types.CreateTicketMessageDocument,
    "\n  query GetTicketMessages($ticketId: Int!, $first: Int, $after: String) {\n    messages(ticketId: $ticketId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          content\n          createdAt\n          author {\n            id\n            firstName\n            lastName\n            role\n          }\n          ticket {\n            id\n            status\n            createdBy { id }\n            assignedTo { id }\n            category { id }\n            ticketDepartment\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.GetTicketMessagesDocument,
    "\n  mutation ClearTicketNotifications($ticketId: Int!) {\n    clearTicketNotifications(ticketId: $ticketId)\n  }\n": types.ClearTicketNotificationsDocument,
    "\n  query NavNotifications {\n    unreadTicketMessages {\n      ticketId\n      count\n      lastMessageAt\n    }\n    ticketNotifications {\n      id\n      type\n      updatedAt\n      ticket {\n        id\n        title\n      }\n    }\n  }\n": types.NavNotificationsDocument,
    "\n  mutation MarkTicketMessagesRead($ticketId: Int!) {\n    markTicketMessagesRead(ticketId: $ticketId) {\n      userId\n      ticketId\n      lastReadMessageId\n      lastReadMessage {\n        id\n        content\n        createdAt\n      }\n    }\n  }\n": types.MarkTicketMessagesReadDocument,
    "\n  query UnreadTicketMessages {\n    unreadTicketMessages {\n      ticketId\n      count\n    }\n  }\n": types.UnreadTicketMessagesDocument,
    "\n fragment TicketFields on Ticket {\n    id\n    title\n    description\n    status\n    priority\n\n    specificData {\n      __typename\n      ... on TicketITSpecific {\n        hardwareType\n        software\n      }\n      ... on TicketHRSpecific {\n        payrollReference\n      }\n      ... on TicketFinanceSpecific {\n        customer\n        invoiceReference\n        budgetType\n      }\n      ... on TicketSupportSpecific {\n        customer\n      }\n      ... on TicketLogisticSpecific {\n        customer\n        shipmentReference\n      }\n    }\n\n    category {\n      id\n      name\n      department\n      specificField\n    }\n\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    dueFirstResponse\n    reopenCount\n    reopenReason\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n      role\n    }\n    closingMessage\n}\n": types.TicketFieldsFragmentDoc,
    "\n  mutation CreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      ...TicketFields\n    }\n  }\n": types.CreateTicketDocument,
    "\n  mutation UpdateTicket($id: Int!, $input: TicketUpdateInput!) {\n    updateTicket(id: $id, input: $input) {\n      ...TicketFields\n    }\n  }\n": types.UpdateTicketDocument,
    "\n  mutation DeleteTicket($id: Int!) {\n    deleteTicket(id: $id) {\n      ...TicketFields\n    }\n  }\n": types.DeleteTicketDocument,
    "\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n    $scope: TicketScope\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter, scope: $scope) {\n  totalCount\n  edges {\n    cursor\n    node {\n      ...TicketFields\n    }\n  }\n  pageInfo { hasNextPage endCursor }\n   }\n  }\n": types.TicketsDocument,
    "\n  query GetTicketById($id: Int!) {\n    ticket(id: $id) {\n      ...TicketFields\n    }\n  }\n": types.GetTicketByIdDocument,
    "\n  query TicketAlerts($scope: TicketScope) {\n    ticketAlerts(scope: $scope) {\n      firstResponseOverdue\n      dueDateOverdue\n      reopened\n      firstResponseDueSoon\n      dueDateDueSoon\n    }\n  }\n": types.TicketAlertsDocument,
    "\n  query SoleSpecialistCategoryIds($department: Department!, $userId: Int) {\n    soleSpecialistCategoryIds(department: $department, userId: $userId)\n  } \n": types.SoleSpecialistCategoryIdsDocument,
    "\n  query usersForCategoryId($categoryId: Int!, $search: String) {\n    usersForCategoryId(categoryId: $categoryId, search: $search) {\n      id\n      firstName\n      lastName\n    }\n  }\n": types.UsersForCategoryIdDocument,
    "\n  mutation AddUserSpecialization($input: UserSpecInput!) {\n    addUserSpecialization(input: $input) {\n      id\n      user {\n        id\n        firstName\n        lastName\n      }\n      category {\n        id\n        name\n      }\n    }\n  }\n": types.AddUserSpecializationDocument,
    "\n  mutation RemoveUserSpecialization($input: UserSpecInput!) {\n    removeUserSpecialization(input: $input)\n  }\n": types.RemoveUserSpecializationDocument,
    "\n  query Me {\n    me {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n": types.MeDocument,
    "\n  query SearchUsers($search: String, $role: Role, $department: Department, $categoryId: Int, $restrictToDepartment: Boolean) {\n    searchUsers(search: $search, role: $role, department: $department, categoryId: $categoryId, restrictToDepartment: $restrictToDepartment) {\n      id\n      firstName\n      lastName\n    }\n  }\n": types.SearchUsersDocument,
    "\n  query UsersManagement($search: String, $userId: Int, $role: Role, $department: Department, $categoryId: Int) {\n    usersForManagement(search: $search, userId: $userId, role: $role, department: $department, categoryId: $categoryId) {\n      id\n      firstName\n      lastName\n      role\n      department\n      specializations {\n        id\n        name\n        department\n      }\n    }\n  }\n": types.UsersManagementDocument,
    "\n  query UsersByDepForLogin($department: Department!) {\n    usersByDepForLogin(department: $department) {\n      id\n      firstName\n      lastName\n      email\n      role\n    }\n  }\n": types.UsersByDepForLoginDocument,
    "\n  mutation UpdateUserRole($input: UpdateUserRoleInput!) {\n    updateUserRole(input: $input) {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n": types.UpdateUserRoleDocument,
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
export function graphql(source: "\n  query GetDashboard {\n    dashboard {\n      counterGroups {\n        scope\n        alerts {\n          firstResponseOverdue\n          dueDateOverdue\n          reopened\n          firstResponseDueSoon\n          dueDateDueSoon\n        }\n      }\n      ticketLists {\n        list\n        tickets {\n          id\n          title\n          status\n          createdAt\n          dueDate\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetDashboard {\n    dashboard {\n      counterGroups {\n        scope\n        alerts {\n          firstResponseOverdue\n          dueDateOverdue\n          reopened\n          firstResponseDueSoon\n          dueDateDueSoon\n        }\n      }\n      ticketLists {\n        list\n        tickets {\n          id\n          title\n          status\n          createdAt\n          dueDate\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation StartDemo {\n    startDemo {\n      success\n      demoSessionId\n    }\n  }\n"): (typeof documents)["\n  mutation StartDemo {\n    startDemo {\n      success\n      demoSessionId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TicketStatsByDepartment {\n    ticketStatsByDepartment {\n      department\n      total\n      open\n      assigned\n      inProgress\n      closed\n      refused\n      firstResponseLate\n      dueDateLate\n      closedOnTime\n      openAssignedLate\n      average\n    }\n  }\n"): (typeof documents)["\n  query TicketStatsByDepartment {\n    ticketStatsByDepartment {\n      department\n      total\n      open\n      assigned\n      inProgress\n      closed\n      refused\n      firstResponseLate\n      dueDateLate\n      closedOnTime\n      openAssignedLate\n      average\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TicketStatsByTechnician {\n    ticketStatsByTechnician {\n      technicianId\n      label\n      total\n      open\n      assigned\n      inProgress\n      closed\n      refused\n      firstResponseLate\n      dueDateLate\n      average\n    }\n  }\n"): (typeof documents)["\n  query TicketStatsByTechnician {\n    ticketStatsByTechnician {\n      technicianId\n      label\n      total\n      open\n      assigned\n      inProgress\n      closed\n      refused\n      firstResponseLate\n      dueDateLate\n      average\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTicketNotificationSubscription($ticketId: Int!) {\n    createTicketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTicketNotificationSubscription($ticketId: Int!) {\n    createTicketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteTicketNotificationSubscription($ticketId: Int!) {\n    deleteTicketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteTicketNotificationSubscription($ticketId: Int!) {\n    deleteTicketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TicketNotificationSubscription($ticketId: Int!) {\n    ticketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n"): (typeof documents)["\n  query TicketNotificationSubscription($ticketId: Int!) {\n    ticketNotificationSubscription(ticketId: $ticketId) {\n      userId\n      ticketId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTicketCategory($input: CreateTicketCategoryInput!) {\n    createTicketCategory(input: $input) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTicketCategory($input: CreateTicketCategoryInput!) {\n    createTicketCategory(input: $input) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateCategory($id: Int!, $input: UpdateCategoryInput!) {\n    updateCategory(id: $id, input: $input) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateCategory($id: Int!, $input: UpdateCategoryInput!) {\n    updateCategory(id: $id, input: $input) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteTicketCategory($id: Int!) {\n    deleteTicketCategory(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteTicketCategory($id: Int!) {\n    deleteTicketCategory(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RestoreTicketCategory($id: Int!) {\n    restoreTicketCategory(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"): (typeof documents)["\n  mutation RestoreTicketCategory($id: Int!) {\n    restoreTicketCategory(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Categories($department: Department, $includeDisabled: Boolean) {\n    categories(department: $department, includeDisabled: $includeDisabled) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"): (typeof documents)["\n  query Categories($department: Department, $includeDisabled: Boolean) {\n    categories(department: $department, includeDisabled: $includeDisabled) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CategoryById($id: Int!) {\n    categoryById(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"): (typeof documents)["\n  query CategoryById($id: Int!) {\n    categoryById(id: $id) {\n      id\n      name\n      department\n      specificField\n      disabled\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CategoryAccesses($categoryId: Int) {\n    categoryAccesses(categoryId: $categoryId) {\n      id\n      categoryId\n      disabled\n      requesterDepartment\n      requesterMinRole\n    }\n  }\n"): (typeof documents)["\n  query CategoryAccesses($categoryId: Int) {\n    categoryAccesses(categoryId: $categoryId) {\n      id\n      categoryId\n      disabled\n      requesterDepartment\n      requesterMinRole\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TicketHistoryFields on TicketHistory {\n    id\n    originalTicketId\n    title\n    description\n    status\n    priority\n    dueDate\n    dueFirstResponse\n    reopenCount\n    reopenReason\n    sourceDepartmentForUser\n    category {\n      id\n      name\n    }\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n    createdAt\n    updatedAt\n    closedAt\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n    ticketSpecific\n    deletedAt\n    deletedBy {\n      id\n      firstName\n      lastName\n    }\n  }\n"): (typeof documents)["\n  fragment TicketHistoryFields on TicketHistory {\n    id\n    originalTicketId\n    title\n    description\n    status\n    priority\n    dueDate\n    dueFirstResponse\n    reopenCount\n    reopenReason\n    sourceDepartmentForUser\n    category {\n      id\n      name\n    }\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n    createdAt\n    updatedAt\n    closedAt\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n    }\n    closingMessage\n    ticketSpecific\n    deletedAt\n    deletedBy {\n      id\n      firstName\n      lastName\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TicketHistoryByTicketId(\n    $ticketId: Int!\n    $first: Int\n    $after: String\n    $filter: TicketHistoryFilter\n  ) {\n    ticketHistoryByTicketId(\n      ticketId: $ticketId\n      first: $first\n      after: $after\n      filter: $filter\n    ) {\n      edges {\n        cursor\n        node {\n          ...TicketHistoryFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query TicketHistoryByTicketId(\n    $ticketId: Int!\n    $first: Int\n    $after: String\n    $filter: TicketHistoryFilter\n  ) {\n    ticketHistoryByTicketId(\n      ticketId: $ticketId\n      first: $first\n      after: $after\n      filter: $filter\n    ) {\n      edges {\n        cursor\n        node {\n          ...TicketHistoryFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DeletedTickets(\n    $first: Int\n    $after: String\n    $filter: TicketHistoryFilter\n    $scope: TicketScope\n  ) {\n    deletedTickets(\n      first: $first\n      after: $after\n      filter: $filter\n      scope: $scope\n    ) {\n      edges {\n        cursor\n        node {\n          ...TicketHistoryFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query DeletedTickets(\n    $first: Int\n    $after: String\n    $filter: TicketHistoryFilter\n    $scope: TicketScope\n  ) {\n    deletedTickets(\n      first: $first\n      after: $after\n      filter: $filter\n      scope: $scope\n    ) {\n      edges {\n        cursor\n        node {\n          ...TicketHistoryFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
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
export function graphql(source: "\n  mutation ClearTicketNotifications($ticketId: Int!) {\n    clearTicketNotifications(ticketId: $ticketId)\n  }\n"): (typeof documents)["\n  mutation ClearTicketNotifications($ticketId: Int!) {\n    clearTicketNotifications(ticketId: $ticketId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query NavNotifications {\n    unreadTicketMessages {\n      ticketId\n      count\n      lastMessageAt\n    }\n    ticketNotifications {\n      id\n      type\n      updatedAt\n      ticket {\n        id\n        title\n      }\n    }\n  }\n"): (typeof documents)["\n  query NavNotifications {\n    unreadTicketMessages {\n      ticketId\n      count\n      lastMessageAt\n    }\n    ticketNotifications {\n      id\n      type\n      updatedAt\n      ticket {\n        id\n        title\n      }\n    }\n  }\n"];
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
export function graphql(source: "\n fragment TicketFields on Ticket {\n    id\n    title\n    description\n    status\n    priority\n\n    specificData {\n      __typename\n      ... on TicketITSpecific {\n        hardwareType\n        software\n      }\n      ... on TicketHRSpecific {\n        payrollReference\n      }\n      ... on TicketFinanceSpecific {\n        customer\n        invoiceReference\n        budgetType\n      }\n      ... on TicketSupportSpecific {\n        customer\n      }\n      ... on TicketLogisticSpecific {\n        customer\n        shipmentReference\n      }\n    }\n\n    category {\n      id\n      name\n      department\n      specificField\n    }\n\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    dueFirstResponse\n    reopenCount\n    reopenReason\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n      role\n    }\n    closingMessage\n}\n"): (typeof documents)["\n fragment TicketFields on Ticket {\n    id\n    title\n    description\n    status\n    priority\n\n    specificData {\n      __typename\n      ... on TicketITSpecific {\n        hardwareType\n        software\n      }\n      ... on TicketHRSpecific {\n        payrollReference\n      }\n      ... on TicketFinanceSpecific {\n        customer\n        invoiceReference\n        budgetType\n      }\n      ... on TicketSupportSpecific {\n        customer\n      }\n      ... on TicketLogisticSpecific {\n        customer\n        shipmentReference\n      }\n    }\n\n    category {\n      id\n      name\n      department\n      specificField\n    }\n\n    createdBy {\n      id\n      firstName\n      lastName\n    }\n\n    assignedTo {\n      id\n      firstName\n      lastName\n    }\n\n    createdAt\n    updatedAt\n    closedAt\n    dueDate\n    dueFirstResponse\n    reopenCount\n    reopenReason\n    sourceDepartmentForUser\n    ticketDepartment\n    lastUpdatedBy {\n      id\n      firstName\n      lastName\n      role\n    }\n    closingMessage\n}\n"];
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
export function graphql(source: "\n  mutation DeleteTicket($id: Int!) {\n    deleteTicket(id: $id) {\n      ...TicketFields\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteTicket($id: Int!) {\n    deleteTicket(id: $id) {\n      ...TicketFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n    $scope: TicketScope\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter, scope: $scope) {\n  totalCount\n  edges {\n    cursor\n    node {\n      ...TicketFields\n    }\n  }\n  pageInfo { hasNextPage endCursor }\n   }\n  }\n"): (typeof documents)["\n  query Tickets(\n    $first: Int\n    $after: String\n    $orderBy: TicketOrderBy\n    $filter: TicketFilter\n    $scope: TicketScope\n  ) {\n    tickets(first: $first, after: $after, orderBy: $orderBy, filter: $filter, scope: $scope) {\n  totalCount\n  edges {\n    cursor\n    node {\n      ...TicketFields\n    }\n  }\n  pageInfo { hasNextPage endCursor }\n   }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTicketById($id: Int!) {\n    ticket(id: $id) {\n      ...TicketFields\n    }\n  }\n"): (typeof documents)["\n  query GetTicketById($id: Int!) {\n    ticket(id: $id) {\n      ...TicketFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TicketAlerts($scope: TicketScope) {\n    ticketAlerts(scope: $scope) {\n      firstResponseOverdue\n      dueDateOverdue\n      reopened\n      firstResponseDueSoon\n      dueDateDueSoon\n    }\n  }\n"): (typeof documents)["\n  query TicketAlerts($scope: TicketScope) {\n    ticketAlerts(scope: $scope) {\n      firstResponseOverdue\n      dueDateOverdue\n      reopened\n      firstResponseDueSoon\n      dueDateDueSoon\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SoleSpecialistCategoryIds($department: Department!, $userId: Int) {\n    soleSpecialistCategoryIds(department: $department, userId: $userId)\n  } \n"): (typeof documents)["\n  query SoleSpecialistCategoryIds($department: Department!, $userId: Int) {\n    soleSpecialistCategoryIds(department: $department, userId: $userId)\n  } \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query usersForCategoryId($categoryId: Int!, $search: String) {\n    usersForCategoryId(categoryId: $categoryId, search: $search) {\n      id\n      firstName\n      lastName\n    }\n  }\n"): (typeof documents)["\n  query usersForCategoryId($categoryId: Int!, $search: String) {\n    usersForCategoryId(categoryId: $categoryId, search: $search) {\n      id\n      firstName\n      lastName\n    }\n  }\n"];
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
export function graphql(source: "\n  query SearchUsers($search: String, $role: Role, $department: Department, $categoryId: Int, $restrictToDepartment: Boolean) {\n    searchUsers(search: $search, role: $role, department: $department, categoryId: $categoryId, restrictToDepartment: $restrictToDepartment) {\n      id\n      firstName\n      lastName\n    }\n  }\n"): (typeof documents)["\n  query SearchUsers($search: String, $role: Role, $department: Department, $categoryId: Int, $restrictToDepartment: Boolean) {\n    searchUsers(search: $search, role: $role, department: $department, categoryId: $categoryId, restrictToDepartment: $restrictToDepartment) {\n      id\n      firstName\n      lastName\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UsersManagement($search: String, $userId: Int, $role: Role, $department: Department, $categoryId: Int) {\n    usersForManagement(search: $search, userId: $userId, role: $role, department: $department, categoryId: $categoryId) {\n      id\n      firstName\n      lastName\n      role\n      department\n      specializations {\n        id\n        name\n        department\n      }\n    }\n  }\n"): (typeof documents)["\n  query UsersManagement($search: String, $userId: Int, $role: Role, $department: Department, $categoryId: Int) {\n    usersForManagement(search: $search, userId: $userId, role: $role, department: $department, categoryId: $categoryId) {\n      id\n      firstName\n      lastName\n      role\n      department\n      specializations {\n        id\n        name\n        department\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UsersByDepForLogin($department: Department!) {\n    usersByDepForLogin(department: $department) {\n      id\n      firstName\n      lastName\n      email\n      role\n    }\n  }\n"): (typeof documents)["\n  query UsersByDepForLogin($department: Department!) {\n    usersByDepForLogin(department: $department) {\n      id\n      firstName\n      lastName\n      email\n      role\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUserRole($input: UpdateUserRoleInput!) {\n    updateUserRole(input: $input) {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUserRole($input: UpdateUserRoleInput!) {\n    updateUserRole(input: $input) {\n      id\n      firstName\n      lastName\n      email\n      role\n      department\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;