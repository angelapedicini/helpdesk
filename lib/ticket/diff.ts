// lib/ticket/diff.ts
import type { TicketHistoryFieldsFragment } from "@/apollo-client/gql/graphql";

export type ChangedFields = Set<string>;

export type TicketHistoryRow = TicketHistoryFieldsFragment;

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
    "ticketSpecific",
    "deletedAt"
] as const;

function normalize(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string" && !isNaN(Date.parse(value)) && value.includes("-")) {
        return value;
    }
    return value ?? null;
}

export function diffTicketHistory(
    current: TicketHistoryRow,
    previous: TicketHistoryRow | undefined
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
    if (current.lastUpdatedBy?.id !== previous.lastUpdatedBy?.id) changed.add("lastUpdatedBy");

    return changed;
}