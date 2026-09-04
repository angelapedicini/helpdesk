"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";


import {
    TicketFieldsFragment,
    TicketScope,
    TicketSortField,
} from "@/apollo-client/gql/graphql";

import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { HeadCell } from "@/components/table";

// Mappa: colonna FE -> campo di sort che il BE si aspetta
export const ticketSortFieldMap: Partial<
    Record<keyof TicketFieldsFragment, TicketSortField>
> = {
    id: "ID",
    title: "TITLE",
    status: "STATUS",
    priority: "PRIORITY",
    ticketDepartment: "DEPARTMENT",
    createdAt: "CREATED_AT",
};

type TicketHeadCellsOptions = {
    scope: TicketScope;
};

export function createTicketHeadCells({
    scope,
}: TicketHeadCellsOptions): HeadCell<TicketFieldsFragment>[] {
    const headCells: HeadCell<TicketFieldsFragment>[] = [
        { id: "id", label: "ID", width: "75px" },
        { id: "title", label: "Titolo" },
        { id: "description", label: "Descrizione", sortable: false },

        {
            id: "status",
            label: "Stato",
            render: (ticket) => {
                const config = TICKET_STATUS_CONFIG[ticket.status];
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
            id: "priority",
            label: "Priorità",
            render: (ticket) => {
                const config = TICKET_PRIORITY_CONFIG[ticket.priority];
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
            id: "category",
            label: "Categoria",
            sortable: false,
            render: (ticket) =>
                ticket.category ? ticket.category.name : "Nessuna categoria",
        },

        {
            id: "specificData",
            label: "Specifica",
            sortable: false,
            render: (ticket) => {
                if (!ticket.specificData) return "Nessuna specifica";
                const { __typename, ...fields } = ticket.specificData;
                return Object.values(fields).filter(Boolean).join(" / ") || "-";
            },
        },

        { id: "ticketDepartment", label: "Dipartimento" },

        {
            id: "createdAt",
            label: "Creazione",
            render: (ticket) =>
                new Date(ticket.createdAt).toLocaleDateString("it-IT"),
        },

        {
            id: "dueDate",
            label: "Entro",
            sortable: false,
            render: (ticket) =>
                ticket.dueDate
                    ? new Date(ticket.dueDate).toLocaleDateString("it-IT")
                    : "-",
        },
    ];

    if (scope === "MINE" || scope === "DEPARTMENT") {
        headCells.push({
            id: "assignedTo",
            label: "Assegnato a",
            sortable: false,
            render: (ticket) =>
                ticket.assignedTo
                    ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                    : "Non assegnato",
        });
    }

    if (scope === "ASSIGNED_TO_ME" || scope === "DEPARTMENT") {
        headCells.push({
            id: "createdBy",
            label: "Creato da",
            sortable: false,
            render: (ticket) =>
                ticket.createdBy
                    ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`
                    : "Non assegnato",
        });
    }

    return headCells;
}