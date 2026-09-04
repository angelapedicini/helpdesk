// lib/ticket/diff.ts
import type { TicketSnapshotFieldsFragment } from "@/apollo-client/gql/graphql";

export type ChangedFields = Set<string>;

const COMPARABLE_SCALAR_FIELDS = [
    "title",
    "description",
    "status",
    "priority",
    "ticketDepartment",
    "sourceDepartmentForUser",
    "dueDate",
    "closedAt",
    "closingMessage",
    "specificValue",
] as const;

function normalize(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string" && !isNaN(Date.parse(value)) && value.includes("-")) {
        return value;
    }
    return value ?? null;
}

export function diffTickets(
    current: TicketSnapshotFieldsFragment,
    previous: TicketSnapshotFieldsFragment | undefined
): ChangedFields {
    const changed: ChangedFields = new Set();
    if (!previous) return changed;

    for (const field of COMPARABLE_SCALAR_FIELDS) {
        if (normalize(current[field]) !== normalize(previous[field])) {
            changed.add(field);
        }
    }

    if (current.category?.id !== previous.category?.id) changed.add("category");
    if (current.assignedTo?.id !== previous.assignedTo?.id) changed.add("assignedTo");

    return changed;
}