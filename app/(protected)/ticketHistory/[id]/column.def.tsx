import type { Column } from "@/components/table";
import type { ChangedFields } from "@/lib/ticket/diff";

import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { fmt } from "@/lib/helper/formt-helpers";
import { Box, Chip } from "@mui/material";

// column.def.tsx
import type { TicketSnapshotFieldsFragment } from "@/apollo-client/gql/graphql";

export type TicketHistoryRow = {
    id: number;
    ticketId: number;
    createdAt: string | Date;
    ticket: TicketSnapshotFieldsFragment;
    changedFields: ChangedFields;
};

export function createTicketHistoryColumns(): Column<TicketHistoryRow>[] {
    return [
        // {
        //     header: "Data modifica",
        //     render: (row) => (row.isCurrent ? "Attuale" : fmt(row.createdAt)),
        //     width: 120,
        // },
        {
            header: "Titolo",
            render: (row) => row.ticket.title,
            highlight: (row) => row.changedFields.has("title"),
            wrap: true,
        },
        {
            header: "Descrizione",
            render: (row) => row.ticket.description ?? "",
            highlight: (row) => row.changedFields.has("description"),
            wrap: true,
        },
        {
            header: "Stato",
            width: 50,
            render: (row) => {
                const { label, icon: Icon, color } = TICKET_STATUS_CONFIG[row.ticket.status];
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color }}>
                        <Icon fontSize="small" sx={{ color }} />
                    </Box>
                );
            },
            highlight: (row) => row.changedFields.has("status"),
        },
        {
            header: "Priorità",
            width: 50,
            render: (row) => {
                if (!row.ticket.priority) return "-";
                const { label, icon: Icon, color } = TICKET_PRIORITY_CONFIG[row.ticket.priority];
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color }}>
                        <Icon fontSize="small" sx={{ color }} />
                    </Box>
                );
            },
            highlight: (row) => row.changedFields.has("priority"),
        },
        {
            header: "Categoria",
            render: (row) => row.ticket.category?.name ?? "-",
            highlight: (row) => row.changedFields.has("category"),
        },
        {
            header: "Creato da",
            render: (row) => {
                const c = row.ticket.createdBy;
                return c ? `${c.lastName} ${c.firstName} ` : "-";
            },
        },
        {
            header: "Assegnato a",
            render: (row) => {
                const a = row.ticket.assignedTo;
                return a ? `${a.lastName} ${a.firstName}` : "Non assegnato";
            },
            highlight: (row) => row.changedFields.has("assignedTo"),
        },
        {
            header: "Ultima modifica di",
            render: (row) => {
                const u = row.ticket.lastUpdatedBy;
                return u ? `${u.lastName} ${u.firstName}` : "-";
            },
        },
        {
            header: "Reparto richiedente",
            width: 60,
            render: (row) => row.ticket.sourceDepartmentForUser ?? "-",
            highlight: (row) => row.changedFields.has("sourceDepartmentForUser"),
        },
        {
            header: "Reparto (ticket)",
            width: 60,
            render: (row) => row.ticket.ticketDepartment ?? "-",
            highlight: (row) => row.changedFields.has("ticketDepartment"),
        },
        {
            header: "Creato il",
            render: (row) => (row.ticket.createdAt ? fmt(row.ticket.createdAt) : "-"),
        },
        {
            header: "Aggiornato il",
            render: (row) => (row.ticket.updatedAt ? fmt(row.ticket.updatedAt) : "-"),
        },
        {
            header: "Scadenza",
            render: (row) => (row.ticket.dueDate ? fmt(row.ticket.dueDate) : "-"),
            highlight: (row) => row.changedFields.has("dueDate"),
        },
        {
            header: "Chiuso il",
            render: (row) => (row.ticket.closedAt ? fmt(row.ticket.closedAt) : "-"),
            highlight: (row) => row.changedFields.has("closedAt"),
        },
        // {
        //     header: "Eliminato il",
        //     render: (row) => (row.ticket.deletedAt ? fmt(row.ticket.deletedAt) : "-"),
        // },
        {
            header: "Messaggio di chiusura",
            render: (row) => row.ticket.closingMessage ?? "-",
            highlight: (row) => row.changedFields.has("closingMessage"),
            wrap: true,
        },
    ];
}