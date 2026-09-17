// lib/ticket/column.def.tsx (o dove si trova)
"use client";

import Box from "@mui/material/Box";

import { TicketHistoryByTicketIdQuery } from "@/graphql-generated/graphql";

import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { HeadCell } from "@/components/table";
import type { TicketHistoryFieldsFragment } from "@/graphql-generated/graphql";

export type TicketHistoryRow = TicketHistoryFieldsFragment;

// Nessun ChangedFields/highlight qui: l'evidenziazione ora è delegata
// interamente a getCellClassName sulla EnhancedTable (classe CSS
// "highlighted-cell" già definita nel tema), non più a uno stile inline.
export function createTicketHistoryHeadCells(): HeadCell<TicketHistoryRow>[] {
    return [

        { id: "title", label: "Titolo", sortable: false, width: 15 },

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
                        {config.label}
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
                        {config.label}
                    </Box>
                );
            },
        },

        {
            id: "category",
            label: "Categoria",
            sortable: false,
            render: (row) => (row.category ? row.category.name : "Nessuna categoria"),
        },


        { id: "ticketDepartment", label: "Dipartimento ticket", sortable: false },

        {
            id: "createdBy",
            label: "Creato da",
            sortable: false,
            render: (row) =>
                row.createdBy ? `${row.createdBy.firstName} ${row.createdBy.lastName}` : "-",
        },

        {
            id: "assignedTo",
            label: "Assegnato a",
            sortable: false,
            render: (row) =>
                row.assignedTo
                    ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}`
                    : "Non assegnato",
        },

        {
            id: "lastUpdatedBy",
            label: "Ultimo aggiornamento di",
            sortable: false,
            render: (row) =>
                row.lastUpdatedBy
                    ? `${row.lastUpdatedBy.firstName} ${row.lastUpdatedBy.lastName}`
                    : "-",
        },

        {
            id: "updatedAt",
            label: "Snapshot",
            sortable: false,
            render: (row) => new Date(row.updatedAt).toLocaleDateString("it-IT"),
        },

        {
            id: "dueDate",
            label: "Entro",
            sortable: false,
            render: (row) => (row.dueDate ? new Date(row.dueDate).toLocaleDateString("it-IT") : "-"),
        },

        {
            id: "closedAt",
            label: "Chiuso il",
            sortable: false,
            render: (row) => (row.closedAt ? new Date(row.closedAt).toLocaleDateString("it-IT") : "-"),
        },
    ];
}