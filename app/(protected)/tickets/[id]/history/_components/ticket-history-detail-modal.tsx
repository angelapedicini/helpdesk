"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import type { SxProps, Theme } from "@mui/material/styles";
import {
    TicketPriority,
    TicketStatus,
} from "@/graphql-generated/graphql";

import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { Department } from "@/lib/validators/enums.schema";
import { TicketHistoryRow } from "../column.def";
import type { ChangedFields } from "@/lib/ticket/diff";
import { toDatetimeLocalValue } from "@/lib/helper/date-helper";
import { TruncatedTextField } from "@/components/truncated-tooltip";

function statusLabel(status: TicketStatus) {
    return TICKET_STATUS_CONFIG[status].label;
}

function priorityLabel(priority: TicketPriority) {
    return TICKET_PRIORITY_CONFIG[priority].label;
}

function departmentLabel(department: string | null | undefined): string {
    if (!department) return "-";
    return DEPARTMENT_CONFIG[department as Department]?.label ?? department;
}

function userLabel(user: { firstName: string; lastName: string } | null | undefined) {
    return user ? `${user.firstName} ${user.lastName}` : "-";
}

function displayValue(value: string | number | null | undefined): string {
    return value === null || value === undefined || value === "" ? "-" : String(value);
}

interface TicketHistoryDetailModalProps {
    row: TicketHistoryRow | null;
    changedFields?: ChangedFields;
}

export default function TicketHistoryDetailModal({
    row,
    changedFields,
}: TicketHistoryDetailModalProps) {
    if (!row) return null;

    const highlightSx = (field: string): SxProps<Theme> | undefined =>
        changedFields?.has(field)
            ? {
                  backgroundColor: (theme: Theme) => theme.palette.ui.highlightedCell,
                  borderRadius: 1,
              }
            : undefined;

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                },
                gap: 3,
                mt: 1,
            }}
        >
            <TruncatedTextField
                label="Creato da"
                value={userLabel(row.createdBy)}
                fullWidth
                disabled
                sx={highlightSx("createdBy")}
            />

            <TruncatedTextField
                label="Assegnato a"
                value={row.assignedTo ? userLabel(row.assignedTo) : "-"}
                fullWidth
                disabled
                sx={highlightSx("assignedTo")}
            />

            <TruncatedTextField
                label="Dipartimento origine"
                value={departmentLabel(row.sourceDepartmentForUser)}
                fullWidth
                disabled
                sx={highlightSx("sourceDepartmentForUser")}
            />

            <TruncatedTextField
                label="Titolo"
                value={displayValue(row.title)}
                fullWidth
                disabled
                sx={highlightSx("title")}
            />

            <TextField
                label="Descrizione"
                value={displayValue(row.description)}
                fullWidth
                multiline
                minRows={3}
                disabled
                sx={{
                    gridColumn: { xs: "1", md: "1 / -1" },
                    ...highlightSx("description"),
                }}
            />

            <TruncatedTextField
                label="Categoria"
                value={row.category ? row.category.name : "-"}
                fullWidth
                disabled
                sx={highlightSx("category")}
            />

            <TruncatedTextField
                label="Specifica"
                value={displayValue(row.ticketSpecific)}
                fullWidth
                disabled
                sx={highlightSx("ticketSpecific")}
            />

            <TruncatedTextField
                label="Stato"
                value={statusLabel(row.status)}
                fullWidth
                disabled
                sx={highlightSx("status")}
            />

            <TruncatedTextField
                label="Priorità"
                value={priorityLabel(row.priority)}
                fullWidth
                disabled
                sx={highlightSx("priority")}
            />

            <TextField
                label="Prima revisione entro"
                value={displayValue(toDatetimeLocalValue(row.dueFirstResponse))}
                type="datetime-local"
                fullWidth
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
                label="Data fine lavoro"
                value={displayValue(toDatetimeLocalValue(row.dueDate))}
                type="datetime-local"
                fullWidth
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
                sx={highlightSx("dueDate")}
            />

            <TextField
                label="Cancellato il"
                value={displayValue(toDatetimeLocalValue(row.deletedAt))}
                type="datetime-local"
                fullWidth
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
                sx={highlightSx("deletedAt")}
            />

            <TruncatedTextField
                label="Dipartimento"
                value={departmentLabel(row.ticketDepartment)}
                fullWidth
                disabled
                sx={highlightSx("ticketDepartment")}
            />

            <TruncatedTextField
                label="N° riaperture"
                value={displayValue(row.reopenCount)}
                fullWidth
                disabled
                sx={highlightSx("reopenCount")}
            />

            <TruncatedTextField
                label="Cancellato da"
                value={userLabel(row.deletedBy)}
                fullWidth
                disabled
                sx={highlightSx("deletedBy")}
            />

            <TextField
                label="Data modifica"
                value={displayValue(toDatetimeLocalValue(row.createdAt))}
                type="datetime-local"
                fullWidth
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
            />

            <TruncatedTextField
                label="Modificato da"
                value={userLabel(row.lastUpdatedBy)}
                fullWidth
                disabled
                sx={highlightSx("lastUpdatedBy")}
            />

            <TextField
                label="Ultima modifica"
                value={displayValue(toDatetimeLocalValue(row.updatedAt))}
                type="datetime-local"
                fullWidth
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
                label="Chiuso il"
                value={row.closedAt ? toDatetimeLocalValue(row.closedAt) : "-"}
                type="datetime-local"
                fullWidth
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
                sx={highlightSx("closedAt")}
            />

            <TextField
                label="Motivo riapertura"
                value={displayValue(row.reopenReason)}
                fullWidth
                multiline
                minRows={2}
                disabled
                sx={{
                    gridColumn: { xs: "1", md: "1 / -1" },
                    ...highlightSx("reopenReason"),
                }}
            />

            <TextField
                label="Messaggio di chiusura"
                value={displayValue(row.closingMessage)}
                fullWidth
                multiline
                minRows={2}
                disabled
                sx={{
                    gridColumn: { xs: "1", md: "1 / -1" },
                    ...highlightSx("closingMessage"),
                }}
            />
        </Box>
    );
}