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


function toDatetimeLocalValue(value: unknown): string {
    if (!value) return "";

    const d = new Date(value as Date | string);

    if (isNaN(d.getTime())) return "";

    const pad = (n: number) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusLabel(status: TicketStatus) {
    return TICKET_STATUS_CONFIG[status].label;
}

function priorityLabel(priority: TicketPriority) {
    return TICKET_PRIORITY_CONFIG[priority].label;
}

// --------------------------------
// STILI CAMPI DISABLED
// --------------------------------

const disabledFieldSx: SxProps<Theme> = {
    "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "currentColor",
        color: "primary.main",
    },
    "& .MuiInputLabel-root.Mui-disabled": {
        color: "text.secondary",
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "action.disabled",
    },
};

const highlightedFieldSx: SxProps<Theme> = {
    ...disabledFieldSx,
    bgcolor: "action.selected",
    borderRadius: 1,
};

interface TicketHistoryDetailModalProps {
    row: TicketHistoryRow | null;
}

export default function TicketHistoryDetailModal({
    row,
    // isOpen,
    // onClose,
}: TicketHistoryDetailModalProps) {
    if (!row) return null;

    const fieldSx = (field: string): SxProps<Theme> =>
        row.changedFields.includes(field) ? highlightedFieldSx : disabledFieldSx;

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
                    label="ID"
                    value={row.id}
                    fullWidth
                    disabled
                    sx={disabledFieldSx}
                />

                <TextField
                    label="Ticket ID"
                    value={row.ticketId}
                    fullWidth
                    disabled
                    sx={disabledFieldSx}
                />

                <TextField
                    label="Titolo"
                    value={row.title}
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
                    value={row.category}
                    fullWidth
                    disabled
                    sx={fieldSx("category")}
                />

                <TextField
                    label="Creato da"
                    value={row.createdBy}
                    fullWidth
                    disabled
                    sx={fieldSx("createdBy")}
                />

                <TextField
                    label="Assegnato a"
                    value={row.assignedTo}
                    fullWidth
                    disabled
                    sx={fieldSx("assignedTo")}
                />

                <TextField
                    label="Modificato da"
                    value={row.lastUpdatedBy}
                    fullWidth
                    disabled
                    sx={fieldSx("lastUpdatedBy")}
                />

                <TextField
                    label="Dipartimento origine"
                    value={row.sourceDepartmentForUser}
                    fullWidth
                    disabled
                    sx={fieldSx("sourceDepartmentForUser")}
                />

                <TextField
                    label="Dipartimento"
                    value={row.ticketDepartment}
                    fullWidth
                    disabled
                    sx={fieldSx("ticketDepartment")}
                />

                <TextField
                    label="Data modifica"
                    value={toDatetimeLocalValue(row.createdAt)}
                    type="datetime-local"
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={disabledFieldSx}
                />

                <TextField
                    label="Ultimo aggiornamento"
                    value={toDatetimeLocalValue(row.updatedAt)}
                    type="datetime-local"
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={fieldSx("updatedAt")}
                />

                <TextField
                    label="Chiuso il"
                    value={toDatetimeLocalValue(row.closedAt)}
                    type="datetime-local"
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={fieldSx("closedAt")}
                />

                <TextField
                    label="Entro"
                    value={row.dueDate ? toDatetimeLocalValue(row.dueDate) : ""}
                    type="datetime-local"
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={fieldSx("dueDate")}
                />

                <TextField
                    label="Descrizione"
                    value={row.description}
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
                    value={row.closingMessage ?? ""}
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