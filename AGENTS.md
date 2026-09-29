<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Mandatory Reading

This file MUST be read in full at the start of every session and before every task.

* Treat every rule in this file as a requirement, not a suggestion.
* Re-read the relevant sections before proposing a plan and before writing code.
* If a request conflicts with a rule in this file, do not silently break the rule: point out the conflict and ask how to proceed.
* If this file and the existing code disagree, follow this file and tell me about the discrepancy.

---

# Language

I may write to you in English or in Italian, and both are equally fine.

* Understand both languages and reply in the language I used in my last message.
* Code identifiers and commit messages are written in English.
* Code comments are written in Italian, following the existing project style.
* User-facing UI text (labels, validation messages, errors) follows the language already used in the project (currently Italian). Follow existing patterns before choosing a language.

---

# Workflow Rules

Before writing or modifying any code, you MUST:

1. Present a short plan that lists:
   * every file you intend to create, modify, or delete
   * a brief summary of the changes for each file
2. Ask for my explicit approval and wait for my answer.
3. Only after I confirm, make the changes.

Additional rules:

* Do not start implementing based on a vague or implicit go-ahead. Wait for a clear confirmation.
* If the plan changes during implementation (new files, different scope), stop and ask again.
* Do not modify files that were not listed in the approved plan.
* Read-only actions (reading files, searching the codebase) do not require approval.
* If a request is ambiguous, ask a clarifying question before proposing a plan.

---

## Project Overview

This project is a full-stack web application built with Next.js and TypeScript.

The architecture must maintain a clear separation between:

* UI layer
* API layer
* Business logic layer
* Data access layer

The main goal is to keep the codebase maintainable, scalable, and easy to understand.

---

# Technology Stack

## Frontend

* Next.js (App Router)
* React
* TypeScript
* Material UI (MUI) for components and styling
* Apollo Client for GraphQL communication
* React Hook Form for form management
* Zod for input validation

Do not introduce Tailwind CSS.

---

## Backend

* GraphQL API
* Prisma ORM
* PostgreSQL database hosted on Neon

Backend architecture:

```
GraphQL Resolver
        |
        ↓
Service / Use Case Layer
        |
        ↓
Prisma ORM
        |
        ↓
PostgreSQL
```

---

# General Development Rules

* Prefer simple and readable solutions.
* Avoid unnecessary abstractions.
* Do not introduce new libraries without a clear reason.
* Follow existing project patterns before creating new ones.
* Do not duplicate logic.
* Keep responsibilities separated.

Avoid over-engineering.

---

# Frontend Rules

## React Components

Components must focus on presentation and UI behavior.

Avoid putting business logic inside React components.

Prefer:

```
Page
 |
 ↓
Container / Data fetching
 |
 ↓
Reusable UI Components
```

Reusable components should receive the data they need through props.

Avoid passing large unnecessary objects when only a few fields are required.

---

## Styling

Use Material UI for:

* layout
* components
* themes
* styling

Do not use Tailwind CSS.

Avoid custom CSS unless Material UI cannot solve the requirement cleanly.

---

# GraphQL Rules

GraphQL schema is the source of truth for API models.

Do not manually create duplicated DTOs for every query response.

Example:

Avoid:

```
UserDTO
UserListDTO
UserProfileDTO
UserCardDTO
```

unless there is a real domain reason.

Prefer:

```
GraphQL Schema
        |
        ↓
Queries define required fields
        |
        ↓
Generated TypeScript types
```

---

## GraphQL Queries

Queries should request only the data needed by the feature.

Example:

```graphql
query {
  users {
    id
    name
  }
}
```

Do not request unnecessary fields without a reason.

---

## GraphQL Fragments

Use fragments only when a group of fields is reused multiple times.

Example:

If many queries use:

```graphql
id
name
avatar
```

a fragment can be introduced.

Do not create fragments for every small query.

---

# Apollo Client Rules

Apollo Client manages server state on the frontend.

Use Apollo for:

* GraphQL queries
* GraphQL mutations
* cache management
* synchronization with backend data

Do not use Redux for server state.

Apollo Client does not replace all client state management.

For UI-only state prefer:

* React state
* Context
* lightweight state solutions if required

Examples of client state:

* modal visibility
* theme
* local UI preferences

Examples of server state:

* users
* orders
* products
* permissions

---

# Error Handling, Notifications and Loading

Errors have two audiences and are written in two different places:

* **Developers** get English messages, written in the backend.
* **Users** get Italian messages, written only in the Apollo link.

## Error flow

```
Service / Resolver
    throws GraphQLError (English message + extensions.code)
        |
        ↓
Apollo notificationLink
    maps extensions.code to an Italian message (graphqlErrorMessages)
        |
        ↓
notify(message, "error")  →  notificationVar  →  notification UI
```

## Backend rules

* Throw `GraphQLError` with an English message meant for developers (debugging, logs).
* Always set `extensions.code`, in `UPPER_SNAKE_CASE`, one per distinct failure cause.
* Reuse existing codes when they fit (`UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_USER_INPUT`, `INTERNAL_SERVER_ERROR`). Create a new code only when the user needs a specific message.
* Never write Italian or user-facing text in the backend.

Example:

```ts
throw new GraphQLError("User cannot be assigned to this ticket", {
  extensions: { code: "ASSIGNED_TO_ERROR" },
});
```

## Frontend rules

* Every new `extensions.code` MUST get an Italian entry in `graphqlErrorMessages` in `lib/apollo-client/notification-link.ts`. Adding the backend error and its Italian message is one single change, and both files must appear in the plan.
* Without a mapping, the user would see the English developer message. Treat a missing mapping as a bug.
* Message fallback order: mapped Italian message, then the error's own message, then the generic "Si è verificato un errore.".
* HTTP errors (network/server) are mapped by status code in `httpErrorMessages`.
* Do not show error notifications for GraphQL or HTTP errors from components or hooks, and do not write `try/catch` + `notify` for them. `notificationLink` already does it. Components only handle UI-specific reactions.
* Zod validation messages on forms are Italian and belong to the form schema. They are separate from this flow.

## Automatic side effects

* `FORBIDDEN` (and HTTP 403) triggers `redirectToDashboard()` from `lib/apollo-client/navigation.ts`.
* `UNAUTHENTICATED` is handled by `authRefreshLink`: it calls the `RefreshToken` mutation, retries the original operation if the refresh succeeds, and redirects to `/` if it fails.
* `RefreshToken`, `Login` and `Register` are excluded from the refresh logic. Keep them excluded.
* Do not duplicate this behavior in components or add other links for the same purpose.

## Success notifications

Every mutation shows a success notification automatically. Control it through the Apollo `context`:

* `successMessage`: custom Italian message. `{field}` placeholders are replaced with values from the mutation's returned payload, so the mutation must select those fields.
* `silent: true`: suppresses the success notification only. Errors are always shown.

```ts
const [createTicket] = useMutation(CREATE_TICKET, {
  context: { successMessage: 'Ticket "{title}" creato con successo.' },
});
```

Manual notifications, when really needed, use `notify(message, severity)` from `lib/apollo-client/notification.ts`.

## Loading

* `loadingLink` increments the global `loadingVar` counter for every in-flight GraphQL operation and decrements it when the operation ends. A value greater than 0 means something is loading.
* Global loading indicators must read `loadingVar` (e.g. `useReactiveVar`). Do not create separate global loading state or duplicate counters.
* The local `loading` flag from Apollo hooks may still be used for local UI, for example disabling a submit button.

## Related files

All files are in `lib/apollo-client/`:

* `notification-link.ts`: error and success notifications, error code to message maps
* `auth-refresh-link.ts`: token refresh and redirect to login
* `navigation.ts`: `redirectToDashboard`
* `notification.ts`: `notify` and `notificationVar`
* `loadingLink` and `loadingVar`: global loading counter, exported from the loading link module

---

# Backend Architecture Rules

## GraphQL Resolvers

Resolvers are the connection point between GraphQL and backend logic.

Resolvers should remain lightweight.

Avoid putting complex business rules directly inside resolvers.

Prefer:

```
Resolver
    |
    ↓
Service
    |
    ↓
Business Logic
    |
    ↓
Prisma
```

Example:

Resolver:

```ts
updateUser(_, args, context) {
  return userService.updateUser(
    context.user,
    args
  );
}
```

---

# Business Logic Rules

Business rules belong inside services/use cases.

Examples:

* permission checks
* calculations
* workflows
* domain validations

Do not put business logic inside:

* React components
* GraphQL schema
* Prisma queries directly

---

# Authorization and Visibility

Authorization must always be handled on the backend.

The frontend can hide UI elements but cannot be considered a security layer.

There are two different concepts:

## Action Authorization

Example:

"Can this user update this order?"

Handled through permissions/policies/services.

---

## Field Visibility

Example:

"Can this user see the salary field?"

Visibility rules should be centralized.

Preferred approach:

```
User Role
    |
    ↓
Permission / Visibility Policy
    |
    ↓
Allowed fields
    |
    ↓
Database query / Resolver
```

Avoid spreading role checks everywhere.

Example:

```ts
const fields = userVisibility.getFields(user.role);
```

The visibility layer decides what fields are available for that role.

---

# Prisma Rules

Prisma is responsible only for database access.

Use Prisma for:

* queries
* mutations
* relations
* transactions

Do not expose Prisma directly to the frontend.

Database access must happen only on the backend.

---

# Validation Rules

Zod valida l'input esterno, con **lo stesso schema** su entrambi i lati.

Lo schema vive in `lib/validators/`, uno per dominio, ed è l'unica sorgente del
tipo dell'input: niente DTO scritti a mano. Il form lo usa con `zodResolver`
(messaggi in italiano; vedi *Error Handling*), il resolver lo usa con
`parseOrThrow()` in `graphql/validate.ts`, che lancia `GraphQLError` con
`extensions.code = BAD_USER_INPUT` e un messaggio inglese per lo sviluppatore.
Anche quando la firma del resolver dichiara `input: unknown`, il resolver usa
solo il valore validato, che è tipizzato con `z.infer`.

Typical flow:

```
React Hook Form
        |
        ↓
zodResolver (stesso schema, messaggi italiani)
        |
        ↓
GraphQL Mutation
        |
        ↓
parseOrThrow (stesso schema, BAD_USER_INPUT)
        |
        ↓
Service
```

Lo schema dichiara la forma intera dell'input, anche dove l'SDL la dichiara già:
serve alla tipizzazione e le righe in eccesso sono innocue, perché GraphQL ha
già bocciato i valori non conformi. Il valore dello schema sono i vincoli che
l'SDL non può esprimere: lunghezze e stringhe libere, range numerici, date,
regole fra campi.

Non aggiungere validation su argomenti scalari che GraphQL garantisce da solo
(`id: Int!`, enum, campi obbligatori): è rumore. Serve solo sugli oggetti
complessi, cioè `input` e `filter`.

Frontend validation improves UX.

Backend validation guarantees correctness.

---

# Database Rules

Use Prisma schema as the source of truth for database models.

Follow proper migration practices.

Avoid raw SQL unless there is a specific performance or technical reason.

---

# Code Quality Rules

Prefer:

* clear names
* small functions
* explicit logic
* readable code

Avoid:

* unnecessary design patterns
* excessive abstractions
* duplicated code
* hidden magic behavior

Use design patterns only when they solve a real problem.

Examples where patterns may be appropriate:

* Strategy for interchangeable business rules
* Factory for complex object creation
* Policy objects for authorization

---

# Forbidden Practices

Do not:

* write or modify code without my explicit approval of the plan
* add Tailwind CSS
* introduce Redux for GraphQL data
* put database logic inside React components
* put large business rules inside GraphQL resolvers
* duplicate API types manually, response or input (lo schema Zod in `lib/validators/` è l'unico tipo dell'input)
* bypass GraphQL using direct frontend database calls
* add dependencies without justification
* show error notifications from components for errors already handled by `notificationLink`
* write Italian user-facing messages in the backend

---

# Development Philosophy

The project should remain:

* strongly typed
* modular
* easy to understand
* easy to extend

Prefer a simple correct solution over a complex optimized solution.

DO NOT INITIATE GIT COMMANDS. ASK ME TO DO THEM, ONLY I WILL PUT IN GIT COMMANDS.