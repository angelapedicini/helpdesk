"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import {
    TicketPriority,
    TicketStatus,
} from "@/apollo-client/gql/graphql";

import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { HeadCell } from "@/components/table";

// ⚠️ aggiusta il path in base a dove hai spostato tab.tsx

// --------------------------------
// ROW (flattened, stesso spirito di TicketFieldsFragment per la page)
// --------------------------------

export interface TicketHistoryRow {
    id: number;
    ticketId: number;
    createdAt: string;

    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: string;
    createdBy: string;
    assignedTo: string;
    updatedAt: string;
    closedAt: string | null;
    dueDate: string | null;
    sourceDepartmentForUser: string;
    ticketDepartment: string;
    lastUpdatedBy: string;
    closingMessage: string | null;
    specificValue: string | null;

    changedFields: string[];
}

// --------------------------------
// COLUMNS
// --------------------------------
export function createTicketHistoryHeadCells(): HeadCell<TicketHistoryRow>[] {
    return [
        { id: "id", label: "ID", sortable: false },

        {
            id: "createdAt",
            label: "Data modifica",
            sortable: false,
            render: (row) => new Date(row.createdAt).toLocaleString("it-IT"),
        },

        { id: "title", label: "Titolo", sortable: false },

        { id: "description", label: "Descrizione", sortable: false },

        {
            id: "status",
            label: "Stato",
            sortable: false,
            render: (row) => {
                const config = TICKET_STATUS_CONFIG[row.status];
                const Icon = config.icon;
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Icon sx={{ color: config.color, fontSize: 20 }} />
                        <Typography component="span" sx={{ color: config.color }}>
                            {/* {config.label} */}
                        </Typography>
                    </Box>
                );
            },
        },

        {
            id: "priority",
            label: "Priorità",
            sortable: false,
            render: (row) => {
                const config = TICKET_PRIORITY_CONFIG[row.priority];
                const Icon = config.icon;
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Icon sx={{ color: config.color, fontSize: 20 }} />
                        <Typography component="span" sx={{ color: config.color }}>
                            {/* {config.label} */}
                        </Typography>
                    </Box>
                );
            },
        },

        { id: "category", label: "Categoria", sortable: false },

        {
            id: "specificValue",
            label: "Specifica",
            sortable: false,
            render: (row) => row.specificValue ?? "-",
        },

        { id: "createdBy", label: "Creato da", sortable: false },

        { id: "assignedTo", label: "Assegnato a", sortable: false },

        {
            id: "updatedAt",
            label: "Ultimo aggiornamento",
            sortable: false,
            render: (row) => new Date(row.updatedAt).toLocaleString("it-IT"),
        },

        {
            id: "closedAt",
            label: "Chiusura",
            sortable: false,
            render: (row) =>
                row.closedAt
                    ? new Date(row.closedAt).toLocaleString("it-IT")
                    : "-",
        },

        {
            id: "dueDate",
            label: "Entro",
            sortable: false,
            render: (row) =>
                row.dueDate
                    ? new Date(row.dueDate).toLocaleDateString("it-IT")
                    : "-",
        },

        {
            id: "sourceDepartmentForUser",
            label: "Dipartimento origine",
            sortable: false,
        },

        { id: "ticketDepartment", label: "Dipartimento", sortable: false },

        { id: "lastUpdatedBy", label: "Modificato da", sortable: false },

        {
            id: "closingMessage",
            label: "Messaggio di chiusura",
            sortable: false,
            render: (row) => row.closingMessage ?? "-",
        },
    ];
}