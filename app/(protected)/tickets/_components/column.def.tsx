"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";


import {
    TicketFieldsFragment,
    TicketScope,
    TicketSortField,
} from "@/graphql-generated/graphql";

import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { HeadCell } from "@/components/table";

type TicketHeadCellsOptions = {
    scope: TicketScope;
};

export function createTicketHeadCells({
    scope,
}: TicketHeadCellsOptions): HeadCell<TicketFieldsFragment>[] {
    const headCells: HeadCell<TicketFieldsFragment>[] = [
        { id: "id", label: "ID", width: "75px" },
        { id: "title", label: "Titolo" },
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
            id: "ticketDepartment",
            label: "Dipartimento",
            render: (ticket) => {
                const config = DEPARTMENT_CONFIG[ticket.ticketDepartment];
                if (!config) return ticket.ticketDepartment;
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
            sortable: true,
            render: (ticket) =>
                ticket.category ? ticket.category.name : "-",
        },
        {
            id: "specificData",
            label: "Specifica",
            sortable: false,
            render: (ticket) => {
                if (!ticket.specificData) return "-";
                const { __typename, ...fields } = ticket.specificData;
                return Object.values(fields).filter(Boolean).join(" / ") || "-";
            },
        },
        {
            id: "dueFirstResponse",
            label: "Revisione iniziale entro",
            sortable: true,
            render: (ticket) =>
                ticket.dueFirstResponse
                    ? new Date(ticket.dueFirstResponse).toLocaleDateString("it-IT")
                    : "-",
        },
        {
            id: "updatedAt",
            label: "Ultimo aggiornament",
            sortable: true,
            render: (ticket) =>
                ticket.updatedAt
                    ? new Date(ticket.updatedAt).toLocaleDateString("it-IT")
                    : "-",
        },
        {
            id: "dueDate",
            label: "Entro",
            sortable: true,
            render: (ticket) =>
                ticket.dueDate
                    ? new Date(ticket.dueDate).toLocaleDateString("it-IT")
                    : "-",
        },
    ];


    if (scope === "ASSIGNED_TO_ME" || scope === "DEPARTMENT" || scope === "ALL") {
        headCells.push({
            id: "createdBy",
            label: "Creato da",
            sortable: true,
            render: (ticket) =>
                ticket.createdBy
                    ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`
                    : "Non assegnato",
        });
    }

    if (scope === "MINE" || scope === "DEPARTMENT" || scope === "ALL") {
        headCells.push({
            id: "assignedTo",
            label: "Assegnato a",
            sortable: true,
            render: (ticket) =>
                ticket.assignedTo
                    ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                    : "Non assegnato",
        });
    }


    return headCells;
}