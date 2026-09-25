// lib/ticket/diff.ts
import type { TicketHistoryFieldsFragment } from "@/graphql-generated/graphql";

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
    "dueFirstResponse",
    "closedAt",
    "closingMessage",
    "ticketSpecific",
    "deletedAt",
    "reopenCount",
    "reopenReason",
] as const;

const COMPARABLE_RELATION_FIELDS = [
    "category",
    "createdBy",
    "assignedTo",
    "lastUpdatedBy",
    "deletedBy",
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

    for (const field of COMPARABLE_RELATION_FIELDS) {
        const currentValue = current[field] as { id: string } | null | undefined;
        const previousValue = previous[field] as { id: string } | null | undefined;

        if ((currentValue?.id ?? null) !== (previousValue?.id ?? null)) {
            changed.add(field);
        }
    }

    return changed;
}