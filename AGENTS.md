<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

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

Use Zod for validating external input.

Typical flow:

```
React Hook Form
        |
        ↓
Zod validation
        |
        ↓
GraphQL Mutation
        |
        ↓
Backend validation
        |
        ↓
Service
```

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

* add Tailwind CSS
* introduce Redux for GraphQL data
* put database logic inside React components
* put large business rules inside GraphQL resolvers
* duplicate API response types manually
* bypass GraphQL using direct frontend database calls
* add dependencies without justification

---

# Development Philosophy

The project should remain:

* strongly typed
* modular
* easy to understand
* easy to extend

Prefer a simple correct solution over a complex optimized solution.
