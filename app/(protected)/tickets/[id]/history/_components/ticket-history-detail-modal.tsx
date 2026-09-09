"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { SxProps, Theme } from "@mui/material/styles";
import {
    TicketPriority,
    TicketStatus,
} from "@/apollo-client/gql/graphql";

import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { TicketHistoryRow } from "../column.def";
import type { ChangedFields } from "@/lib/ticket/diff";
import { toDatetimeLocalValue } from "@/lib/helper/date-helper";


function statusLabel(status: TicketStatus) {
    return TICKET_STATUS_CONFIG[status].label;
}

function priorityLabel(priority: TicketPriority) {
    return TICKET_PRIORITY_CONFIG[priority].label;
}

function userLabel(user: { firstName: string; lastName: string } | null | undefined) {
    return user ? `${user.firstName} ${user.lastName}` : "-";
}

function displayValue(value: string | number | null | undefined): string {
    return value === null || value === undefined || value === "" ? "-" : String(value);
}

// --------------------------------
// STILI CAMPI DISABLED (bordo invisibile, tema-agnostico)
// --------------------------------

const disabledFieldSx: SxProps<Theme> = {
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "transparent !important",
    },
    "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "currentColor",
        color: "primary.main",
        opacity: "1 !important",
    },
    "& .MuiInputLabel-root.Mui-disabled": {
        color: "text.secondary",
        opacity: "1 !important",
    },
};

const highlightedFieldSx: SxProps<Theme> = {
    ...disabledFieldSx,
    "& .MuiOutlinedInput-root": (theme) => ({
        backgroundColor: `${theme.palette.action.selected} !important`,
    }),
    borderRadius: 1,
};

interface TicketHistoryDetailModalProps {
    row: TicketHistoryRow | null;
    changedFields?: ChangedFields;
}

export default function TicketHistoryDetailModal({
    row,
    changedFields,
}: TicketHistoryDetailModalProps) {
    if (!row) return null;

    const fieldSx = (field: string): SxProps<Theme> =>
        changedFields?.has(field) ? highlightedFieldSx : disabledFieldSx;

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

                <TextField
                    label="Titolo"
                    value={displayValue(row.title)}
                    fullWidth
                    disabled
                    sx={fieldSx("title")}
                />

                <TextField
                    label="Stato"
                    value={statusLabel(row.status)}
                    fullWidth
                    disabled
                    sx={fieldSx("status")}
                />

                <TextField
                    label="Priorità"
                    value={priorityLabel(row.priority)}
                    fullWidth
                    disabled
                    sx={fieldSx("priority")}
                />

                <TextField
                    label="Categoria"
                    value={row.category ? row.category.name : "-"}
                    fullWidth
                    disabled
                    sx={fieldSx("category")}
                />

                <TextField
                    label="Specifica"
                    value={displayValue(row.ticketSpecific)}
                    fullWidth
                    disabled
                    sx={fieldSx("ticketSpecific")}
                />

                <TextField
                    label="Creato da"
                    value={userLabel(row.createdBy)}
                    fullWidth
                    disabled
                    sx={fieldSx("createdBy")}
                />

                <TextField
                    label="Assegnato a"
                    value={row.assignedTo ? userLabel(row.assignedTo) : "-"}
                    fullWidth
                    disabled
                    sx={fieldSx("assignedTo")}
                />

                <TextField
                    label="Modificato da"
                    value={userLabel(row.lastUpdatedBy)}
                    fullWidth
                    disabled
                    sx={fieldSx("lastUpdatedBy")}
                />

                <TextField
                    label="Dipartimento origine"
                    value={displayValue(row.sourceDepartmentForUser)}
                    fullWidth
                    disabled
                    sx={fieldSx("sourceDepartmentForUser")}
                />

                <TextField
                    label="Dipartimento"
                    value={displayValue(row.ticketDepartment)}
                    fullWidth
                    disabled
                    sx={fieldSx("ticketDepartment")}
                />

                <TextField
                    label="Data modifica"
                    value={displayValue(toDatetimeLocalValue(row.createdAt))}
                    type="datetime-local"
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={disabledFieldSx}
                />

                <TextField
                    label="Ultimo aggiornamento"
                    value={row.lastUpdatedBy ? userLabel(row.lastUpdatedBy) : "-"}
                    type="datetime-local"
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={fieldSx("lastUpdatedBy")}
                />

                <TextField
                    label="Ultimo aggiornamento di"
                    value={displayValue(toDatetimeLocalValue(row.updatedAt))}
                    type="datetime-local"
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={fieldSx("updatedAt")}
                />

                <TextField
                    label="Chiuso il"
                    value={row.closedAt ? toDatetimeLocalValue(row.closedAt) : "-"}
                    type={row.closedAt ? "datetime-local" : "text"}
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={fieldSx("closedAt")}
                />

                <TextField
                    label="Entro"
                    value={row.dueDate ? toDatetimeLocalValue(row.dueDate) : "-"}
                    type={row.dueDate ? "datetime-local" : "text"}
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={fieldSx("dueDate")}
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
                        ...fieldSx("description"),
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
                        ...fieldSx("closingMessage"),
                    }}
                />
            </Box>
    );
}