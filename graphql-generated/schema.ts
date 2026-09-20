export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: string; output: string; }
};

export const BudgetType = {
  CloudServices: 'CLOUD_SERVICES',
  Consulting: 'CONSULTING',
  ItInfrastructure: 'IT_INFRASTRUCTURE',
  Maintenance: 'MAINTENANCE',
  NewHardware: 'NEW_HARDWARE',
  OfficeEquipment: 'OFFICE_EQUIPMENT',
  Security: 'SECURITY',
  SoftwareLicense: 'SOFTWARE_LICENSE',
  Training: 'TRAINING',
  Travel: 'TRAVEL'
} as const;

export type BudgetType = typeof BudgetType[keyof typeof BudgetType];
export type CreateTicketCategoryAccessInput = {
  categoryId: Scalars['Int']['input'];
  requesterDepartment?: InputMaybe<Department>;
  requesterMinRole: Role;
};

export type CreateTicketCategoryInput = {
  department: Department;
  name: Scalars['String']['input'];
  specificField: TicketSpecificField;
};

export type CreateUserInput = {
  department: Department;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export const Customer = {
  Accenture: 'ACCENTURE',
  Acme: 'ACME',
  Amazon: 'AMAZON',
  Apple: 'APPLE',
  Deloitte: 'DELOITTE',
  Google: 'GOOGLE',
  Ibm: 'IBM',
  Microsoft: 'MICROSOFT',
  Oracle: 'ORACLE',
  Sap: 'SAP'
} as const;

export type Customer = typeof Customer[keyof typeof Customer];
export const Department = {
  Finance: 'FINANCE',
  Hr: 'HR',
  It: 'IT',
  Logistic: 'LOGISTIC',
  Support: 'SUPPORT'
} as const;

export type Department = typeof Department[keyof typeof Department];
export const HardwareType = {
  Desktop: 'DESKTOP',
  DockingStation: 'DOCKING_STATION',
  Keyboard: 'KEYBOARD',
  Laptop: 'LAPTOP',
  Monitor: 'MONITOR',
  Mouse: 'MOUSE',
  Printer: 'PRINTER',
  Server: 'SERVER',
  Smartphone: 'SMARTPHONE',
  Tablet: 'TABLET'
} as const;

export type HardwareType = typeof HardwareType[keyof typeof HardwareType];
export type LoginInput = {
  email: Scalars['String']['input'];
};

export type LoginPayload = {
  __typename?: 'LoginPayload';
  user: User;
};

export type LogoutPayload = {
  __typename?: 'LogoutPayload';
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  addUserSpecialization: UserSpecializationTot;
  createTicket: Ticket;
  createTicketCategory: TicketCategory;
  createTicketCategoryAccess: TicketCategoryAccess;
  createTicketMessage: TicketMessage;
  createTicketNotificationSubscription: TicketAdminNotificationSubscription;
  createUser: User;
  deleteTicket: Ticket;
  deleteTicketCategory: TicketCategory;
  deleteTicketCategoryAccess: TicketCategoryAccess;
  deleteTicketMessage: TicketMessage;
  deleteTicketNotificationSubscription: TicketAdminNotificationSubscription;
  login: LoginPayload;
  logout: LogoutPayload;
  markTicketMessagesRead?: Maybe<TicketReadState>;
  refreshToken: RefreshPayload;
  removeUserSpecialization: Scalars['Boolean']['output'];
  restoreTicketCategory: TicketCategory;
  restoreTicketCategoryAccess: TicketCategoryAccess;
  startDemo: StartDemoResult;
  updateTicket: Ticket;
  updateTicketCategory: TicketCategory;
  updateUserRole: User;
};


export type MutationAddUserSpecializationArgs = {
  input: UserSpecInput;
};


export type MutationCreateTicketArgs = {
  input: TicketInput;
};


export type MutationCreateTicketCategoryArgs = {
  input: CreateTicketCategoryInput;
};


export type MutationCreateTicketCategoryAccessArgs = {
  input: CreateTicketCategoryAccessInput;
};


export type MutationCreateTicketMessageArgs = {
  input: TicketMessageInput;
};


export type MutationCreateTicketNotificationSubscriptionArgs = {
  ticketId: Scalars['Int']['input'];
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteTicketArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteTicketCategoryArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteTicketCategoryAccessArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteTicketMessageArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteTicketNotificationSubscriptionArgs = {
  ticketId: Scalars['Int']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkTicketMessagesReadArgs = {
  ticketId: Scalars['Int']['input'];
};


export type MutationRemoveUserSpecializationArgs = {
  input: UserSpecInput;
};


export type MutationRestoreTicketCategoryArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRestoreTicketCategoryAccessArgs = {
  id: Scalars['Int']['input'];
};


export type MutationUpdateTicketArgs = {
  id: Scalars['Int']['input'];
  input: TicketUpdateInput;
};


export type MutationUpdateTicketCategoryArgs = {
  id: Scalars['Int']['input'];
  input: UpdateTicketCategoryInput;
};


export type MutationUpdateUserRoleArgs = {
  input: UpdateUserRoleInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  categories: Array<TicketCategory>;
  categoryAccesses: Array<TicketCategoryAccess>;
  categoryById?: Maybe<TicketCategory>;
  deletedTickets: TicketHistoryConnection;
  me?: Maybe<User>;
  messages: TicketMessageConnection;
  searchUsers: Array<User>;
  soleSpecialistCategoryIds: Array<Scalars['Int']['output']>;
  ticket?: Maybe<Ticket>;
  ticketHistory: TicketHistoryConnection;
  ticketHistoryByTicketId: TicketHistoryConnection;
  ticketNotificationSubscription?: Maybe<TicketAdminNotificationSubscription>;
  ticketStatsByDepartment: Array<TicketStatsByDepartment>;
  ticketStatsByTechnician: Array<TicketStatsByTechnician>;
  tickets: TicketConnection;
  unreadTicketMessages: Array<TicketUnreadCount>;
  usersByDepForLogin: Array<UserLoginInfo>;
  usersForCategoryId: Array<UserBasicInfo>;
};


export type QueryCategoriesArgs = {
  department?: InputMaybe<Department>;
};


export type QueryCategoryAccessesArgs = {
  categoryId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCategoryByIdArgs = {
  id: Scalars['Int']['input'];
};


export type QueryDeletedTicketsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<TicketHistoryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  scope?: InputMaybe<TicketScope>;
};


export type QueryMessagesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  ticketId: Scalars['Int']['input'];
};


export type QuerySearchUsersArgs = {
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  department?: InputMaybe<Department>;
  role?: InputMaybe<Role>;
  search?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySoleSpecialistCategoryIdsArgs = {
  department: Department;
  userId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTicketArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTicketHistoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<TicketHistoryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTicketHistoryByTicketIdArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<TicketHistoryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  ticketId: Scalars['Int']['input'];
};


export type QueryTicketNotificationSubscriptionArgs = {
  ticketId: Scalars['Int']['input'];
};


export type QueryTicketStatsByDepartmentArgs = {
  department?: InputMaybe<Department>;
};


export type QueryTicketStatsByTechnicianArgs = {
  department?: InputMaybe<Department>;
};


export type QueryTicketsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<TicketFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TicketOrderBy>;
  scope?: InputMaybe<TicketScope>;
};


export type QueryUsersByDepForLoginArgs = {
  department: Department;
};


export type QueryUsersForCategoryIdArgs = {
  categoryId: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};

export type RefreshPayload = {
  __typename?: 'RefreshPayload';
  success: Scalars['Boolean']['output'];
};

export const Role = {
  Admin: 'ADMIN',
  Employee: 'EMPLOYEE',
  SystemAdmin: 'SYSTEM_ADMIN',
  Technician: 'TECHNICIAN'
} as const;

export type Role = typeof Role[keyof typeof Role];
export const Software = {
  Confluence: 'CONFLUENCE',
  Excel: 'EXCEL',
  Github: 'GITHUB',
  Gitlab: 'GITLAB',
  Jira: 'JIRA',
  MicrosoftTeams: 'MICROSOFT_TEAMS',
  Outlook: 'OUTLOOK',
  Powerpoint: 'POWERPOINT',
  Salesforce: 'SALESFORCE',
  Sap: 'SAP',
  Slack: 'SLACK',
  Word: 'WORD'
} as const;

export type Software = typeof Software[keyof typeof Software];
export const SortDirection = {
  Asc: 'ASC',
  Desc: 'DESC'
} as const;

export type SortDirection = typeof SortDirection[keyof typeof SortDirection];
export type StartDemoResult = {
  __typename?: 'StartDemoResult';
  demoSessionId: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Ticket = {
  __typename?: 'Ticket';
  assignedTo?: Maybe<User>;
  category?: Maybe<TicketCategory>;
  closedAt?: Maybe<Scalars['Date']['output']>;
  closingMessage?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy: User;
  description: Scalars['String']['output'];
  dueDate?: Maybe<Scalars['Date']['output']>;
  dueFirstResponse?: Maybe<Scalars['Date']['output']>;
  id: Scalars['Int']['output'];
  lastUpdatedBy?: Maybe<User>;
  priority: TicketPriority;
  reopenCount: Scalars['Int']['output'];
  reopenReason?: Maybe<Scalars['String']['output']>;
  sourceDepartmentForUser: Department;
  specificData?: Maybe<TicketSpecific>;
  status: TicketStatus;
  ticketDepartment: Department;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
};

export type TicketAdminNotificationSubscription = {
  __typename?: 'TicketAdminNotificationSubscription';
  ticketId: Scalars['Int']['output'];
  userId: Scalars['Int']['output'];
};

export type TicketCategory = {
  __typename?: 'TicketCategory';
  department: Department;
  disabled?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  specificField?: Maybe<TicketSpecificField>;
};

export type TicketCategoryAccess = {
  __typename?: 'TicketCategoryAccess';
  categoryId: Scalars['Int']['output'];
  disabled?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['Int']['output'];
  requesterDepartment?: Maybe<Department>;
  requesterMinRole: Role;
};

export type TicketConnection = {
  __typename?: 'TicketConnection';
  edges: Array<TicketEdge>;
  pageInfo: PageInfo;
};

export type TicketEdge = {
  __typename?: 'TicketEdge';
  cursor: Scalars['String']['output'];
  node: Ticket;
};

export type TicketFilter = {
  assignedToId?: InputMaybe<Scalars['Int']['input']>;
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  createdById?: InputMaybe<Scalars['Int']['input']>;
  dueDateFrom?: InputMaybe<Scalars['Date']['input']>;
  dueDateTo?: InputMaybe<Scalars['Date']['input']>;
  firstResponseOverdue?: InputMaybe<Scalars['Boolean']['input']>;
  overdue?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<TicketPriority>;
  reopened?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<TicketStatus>;
  unassigned?: InputMaybe<Scalars['Boolean']['input']>;
};

export type TicketFinanceSpecific = {
  __typename?: 'TicketFinanceSpecific';
  budgetType?: Maybe<BudgetType>;
  customer?: Maybe<Customer>;
  invoiceReference?: Maybe<Scalars['String']['output']>;
};

export type TicketHrSpecific = {
  __typename?: 'TicketHRSpecific';
  employeeReference?: Maybe<Scalars['String']['output']>;
  payrollReference?: Maybe<Scalars['String']['output']>;
};

export type TicketHistory = {
  __typename?: 'TicketHistory';
  assignedTo?: Maybe<User>;
  category?: Maybe<TicketCategory>;
  closedAt?: Maybe<Scalars['Date']['output']>;
  closingMessage?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<User>;
  deletedAt?: Maybe<Scalars['Date']['output']>;
  deletedBy?: Maybe<User>;
  description: Scalars['String']['output'];
  dueDate?: Maybe<Scalars['Date']['output']>;
  dueFirstResponse?: Maybe<Scalars['Date']['output']>;
  id: Scalars['Int']['output'];
  lastUpdatedBy?: Maybe<User>;
  originalTicketId: Scalars['Int']['output'];
  priority: TicketPriority;
  reopenCount: Scalars['Int']['output'];
  reopenReason?: Maybe<Scalars['String']['output']>;
  sourceDepartmentForUser: Department;
  status: TicketStatus;
  ticketDepartment: Department;
  ticketSpecific?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
};

export type TicketHistoryConnection = {
  __typename?: 'TicketHistoryConnection';
  edges: Array<TicketHistoryEdge>;
  pageInfo: PageInfo;
};

export type TicketHistoryEdge = {
  __typename?: 'TicketHistoryEdge';
  cursor: Scalars['String']['output'];
  node: TicketHistory;
};

export type TicketHistoryFilter = {
  assignedToId?: InputMaybe<Scalars['Int']['input']>;
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  createdById?: InputMaybe<Scalars['Int']['input']>;
  dueDateFrom?: InputMaybe<Scalars['Date']['input']>;
  dueDateTo?: InputMaybe<Scalars['Date']['input']>;
  overdue?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<TicketPriority>;
  status?: InputMaybe<TicketStatus>;
  unassigned?: InputMaybe<Scalars['Boolean']['input']>;
};

export type TicketItSpecific = {
  __typename?: 'TicketITSpecific';
  hardwareType?: Maybe<HardwareType>;
  software?: Maybe<Software>;
};

export type TicketInput = {
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  department: Department;
  description: Scalars['String']['input'];
  priority: TicketPriority;
  specificValue?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type TicketLogisticSpecific = {
  __typename?: 'TicketLogisticSpecific';
  customer?: Maybe<Customer>;
  shipmentReference?: Maybe<Scalars['String']['output']>;
};

export type TicketMessage = {
  __typename?: 'TicketMessage';
  author: User;
  content: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  id: Scalars['Int']['output'];
  ticket: Ticket;
  ticketId: Scalars['Int']['output'];
};

export type TicketMessageConnection = {
  __typename?: 'TicketMessageConnection';
  edges: Array<TicketMessageEdge>;
  pageInfo: PageInfo;
};

export type TicketMessageEdge = {
  __typename?: 'TicketMessageEdge';
  cursor: Scalars['String']['output'];
  node: TicketMessage;
};

export type TicketMessageInput = {
  content: Scalars['String']['input'];
  ticketId: Scalars['Int']['input'];
};

export type TicketOrderBy = {
  direction: SortDirection;
  field: TicketSortField;
};

export const TicketPriority = {
  High: 'HIGH',
  Low: 'LOW',
  Medium: 'MEDIUM',
  Urgent: 'URGENT'
} as const;

export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority];
export type TicketReadState = {
  __typename?: 'TicketReadState';
  lastReadMessage?: Maybe<TicketMessage>;
  lastReadMessageId?: Maybe<Scalars['Int']['output']>;
  ticketId: Scalars['Int']['output'];
  userId: Scalars['Int']['output'];
};

export const TicketScope = {
  All: 'ALL',
  AssignedToMe: 'ASSIGNED_TO_ME',
  Department: 'DEPARTMENT',
  Mine: 'MINE'
} as const;

export type TicketScope = typeof TicketScope[keyof typeof TicketScope];
export const TicketSortField = {
  AssignedTo: 'ASSIGNED_TO',
  Category: 'CATEGORY',
  ClosedAt: 'CLOSED_AT',
  CreatedAt: 'CREATED_AT',
  CreatedBy: 'CREATED_BY',
  Department: 'DEPARTMENT',
  Description: 'DESCRIPTION',
  DueDate: 'DUE_DATE',
  DueFirstResponse: 'DUE_FIRST_RESPONSE',
  Id: 'ID',
  Priority: 'PRIORITY',
  Status: 'STATUS',
  Title: 'TITLE',
  UpdatedAt: 'UPDATED_AT'
} as const;

export type TicketSortField = typeof TicketSortField[keyof typeof TicketSortField];
export type TicketSpecific = TicketFinanceSpecific | TicketHrSpecific | TicketItSpecific | TicketLogisticSpecific | TicketSupportSpecific;

export const TicketSpecificField = {
  BudgetType: 'BUDGET_TYPE',
  Customer: 'CUSTOMER',
  EmployeeReference: 'EMPLOYEE_REFERENCE',
  HardwareType: 'HARDWARE_TYPE',
  InvoiceReference: 'INVOICE_REFERENCE',
  PayrollReference: 'PAYROLL_REFERENCE',
  ShipmentReference: 'SHIPMENT_REFERENCE',
  Software: 'SOFTWARE'
} as const;

export type TicketSpecificField = typeof TicketSpecificField[keyof typeof TicketSpecificField];
export type TicketStatsByDepartment = {
  __typename?: 'TicketStatsByDepartment';
  assigned: Scalars['Int']['output'];
  average: Scalars['Float']['output'];
  closed: Scalars['Int']['output'];
  closedOnTime: Scalars['Int']['output'];
  department: Department;
  dueDateLate: Scalars['Int']['output'];
  firstResponseLate: Scalars['Int']['output'];
  inProgress: Scalars['Int']['output'];
  open: Scalars['Int']['output'];
  openAssignedLate: Scalars['Int']['output'];
  refused: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type TicketStatsByTechnician = {
  __typename?: 'TicketStatsByTechnician';
  assigned: Scalars['Int']['output'];
  average: Scalars['Float']['output'];
  closed: Scalars['Int']['output'];
  dueDateLate: Scalars['Int']['output'];
  firstResponseLate: Scalars['Int']['output'];
  inProgress: Scalars['Int']['output'];
  label: Scalars['String']['output'];
  open: Scalars['Int']['output'];
  refused: Scalars['Int']['output'];
  technicianId: Scalars['ID']['output'];
  total: Scalars['Int']['output'];
};

export const TicketStatus = {
  Assigned: 'ASSIGNED',
  Closed: 'CLOSED',
  InProgress: 'IN_PROGRESS',
  Open: 'OPEN',
  Refused: 'REFUSED'
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];
export type TicketSupportSpecific = {
  __typename?: 'TicketSupportSpecific';
  customer?: Maybe<Customer>;
};

export type TicketUnreadCount = {
  __typename?: 'TicketUnreadCount';
  count: Scalars['Int']['output'];
  ticketId: Scalars['Int']['output'];
};

export type TicketUpdateInput = {
  assignedToId?: InputMaybe<Scalars['Int']['input']>;
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  closingMessage?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['Date']['input']>;
  priority?: InputMaybe<TicketPriority>;
  reopenReason?: InputMaybe<Scalars['String']['input']>;
  specificValue?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TicketStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTicketCategoryInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  specificField?: InputMaybe<TicketSpecificField>;
};

export type UpdateUserRoleInput = {
  role: Role;
  userId: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  department: Department;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  lastName: Scalars['String']['output'];
  role: Role;
  specializations: Array<TicketCategory>;
};

export type UserBasicInfo = {
  __typename?: 'UserBasicInfo';
  firstName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  lastName: Scalars['String']['output'];
};

export type UserLoginInfo = {
  __typename?: 'UserLoginInfo';
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  lastName: Scalars['String']['output'];
  role: Role;
};

export type UserPermission = {
  __typename?: 'UserPermission';
  action: Scalars['String']['output'];
  granted: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  user: User;
};

export type UserSpecInput = {
  categoryId: Scalars['Int']['input'];
  userId: Scalars['Int']['input'];
};

export type UserSpecialization = {
  __typename?: 'UserSpecialization';
  categoryId?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  user: User;
};

export type UserSpecializationTot = {
  __typename?: 'UserSpecializationTot';
  category: TicketCategory;
  id: Scalars['Int']['output'];
  user: User;
};
