"use client";

import { useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import HistoryIcon from "@mui/icons-material/History";

import type { TicketHistoryFieldsFragment } from "@/graphql-generated/graphql";

import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { HeadCell } from "@/components/table";
import { Box, Typography } from "@mui/material";

export type DeletedTicketRow = TicketHistoryFieldsFragment;

export function createDeletedTicketHeadCells(): HeadCell<DeletedTicketRow>[] {
    return [
        { id: "originalTicketId", label: "Ticket originale", sortable: false },

        { id: "title", label: "Titolo", sortable: false },

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

        {
            id: "ticketDepartment",
            label: "Dipartimento",
            sortable: false,
            render: (row) => {
                const config = DEPARTMENT_CONFIG[row.ticketDepartment];
                if (!config) return row.ticketDepartment;
                const Icon = config.icon;
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Icon sx={{ color: config.color, fontSize: 20 }} />
                        <Typography component="span" sx={{ color: config.color }}>
                            {config.label}
                        </Typography>
                    </Box>
                );
            },
        },

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
            id: "deletedBy",
            label: "Eliminato da",
            sortable: false,
            render: (row) =>
                row.deletedBy ? `${row.deletedBy.firstName} ${row.deletedBy.lastName}` : "-",
        },

        {
            id: "deletedAt",
            label: "Eliminato il",
            sortable: false,
            render: (row) =>
                row.deletedAt ? new Date(row.deletedAt).toLocaleDateString("it-IT") : "-",
        },
    ];
}

export function DeletedTicketHistoryAction({ ticketId }: { ticketId: number }) {
    const router = useRouter();

    return (
        <IconButton
            aria-label="Vedi storico"
            onClick={() => router.push(`/tickets/${ticketId}/history`)}
        >
            <HistoryIcon />
        </IconButton>
    );
}