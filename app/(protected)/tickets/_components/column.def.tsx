"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { GridColDef } from "@mui/x-data-grid";

import type {
    TicketFieldsFragment,
    TicketScope,
} from "@/graphql-generated/graphql";

import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";

type Row = TicketFieldsFragment;

type TicketColumnsOptions = {
    scope: TicketScope;
    renderActions: (ticket: Row) => ReactNode;
};

// Icona + etichetta colorata, usata da stato / priorità / dipartimento
function IconLabel({
    icon: Icon,
    color,
    label,
}: {
    icon: React.ElementType;
    color: string;
    label: string;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                height: "100%",
                minWidth: 0,
            }}
        >
            <Icon sx={{ color, fontSize: 20, flexShrink: 0 }} />
            <Typography component="span" noWrap sx={{ color, minWidth: 0 }}>
                {label}
            </Typography>
        </Box>
    );
}

const formatDate = (value: Date | null) =>
    value ? value.toLocaleDateString("it-IT") : "-";

const toDate = (value?: string | null) => (value ? new Date(value) : null);

const fullName = (user?: { firstName: string; lastName: string } | null) =>
    user ? `${user.firstName} ${user.lastName}` : "Non assegnato";

// Larghezze: ogni colonna ha un "peso" (flex) con cui si divide lo spazio
// disponibile e un minWidth sotto cui non si restringe. Lo scroll orizzontale
// compare solo se la somma dei minWidth supera la larghezza del contenitore.
// Id e azioni restano a larghezza fissa.
// Le stesse colonne sono usate dal DataGrid (desktop) e dalla CardList (mobile).
export function createTicketColumns({
    scope,
    renderActions,
}: TicketColumnsOptions): GridColDef<Row>[] {
    const columns: GridColDef<Row>[] = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "title", headerName: "Titolo", flex: 2, minWidth: 120 },
        {
            field: "status",
            headerName: "Stato",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                const config = TICKET_STATUS_CONFIG[params.row.status];
                return (
                    <IconLabel icon={config.icon} color={config.color} label={config.label} />
                );
            },
        },
        {
            field: "priority",
            headerName: "Priorità",
            flex: 1,
            minWidth: 90,
            renderCell: (params) => {
                const config = TICKET_PRIORITY_CONFIG[params.row.priority];
                return (
                    <IconLabel icon={config.icon} color={config.color} label={config.label} />
                );
            },
        },
        {
            field: "ticketDepartment",
            headerName: "Dipartimento",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                const config = DEPARTMENT_CONFIG[params.row.ticketDepartment];
                if (!config) return params.row.ticketDepartment;
                return (
                    <IconLabel icon={config.icon} color={config.color} label={config.label} />
                );
            },
        },
        {
            field: "category",
            headerName: "Categoria",
            flex: 1,
            minWidth: 90,
            valueGetter: (_value, row) => row.category?.name ?? "-",
        },
        {
            field: "specificData",
            headerName: "Specifica",
            flex: 1,
            minWidth: 90,
            sortable: false,
            valueGetter: (_value, row) => {
                if (!row.specificData) return "-";
                const { __typename, ...fields } = row.specificData;
                return Object.values(fields).filter(Boolean).join(" / ") || "-";
            },
        },
        {
            field: "dueFirstResponse",
            headerName: "Revisione iniziale entro",
            type: "date",
            flex: 1,
            minWidth: 90,
            valueGetter: (value) => toDate(value),
            valueFormatter: formatDate,
        },
        {
            field: "updatedAt",
            headerName: "Ultimo aggiornamento",
            type: "date",
            flex: 1,
            minWidth: 90,
            valueGetter: (value) => toDate(value),
            valueFormatter: formatDate,
        },
        {
            field: "dueDate",
            headerName: "Entro",
            type: "date",
            flex: 1,
            minWidth: 80,
            valueGetter: (value) => toDate(value),
            valueFormatter: formatDate,
        },
    ];

    if (scope === "ASSIGNED_TO_ME" || scope === "DEPARTMENT" || scope === "ALL") {
        columns.push({
            field: "createdBy",
            headerName: "Creato da",
            flex: 1,
            minWidth: 90,
            valueGetter: (_value, row) => fullName(row.createdBy),
        });
    }

    if (scope === "MINE" || scope === "DEPARTMENT" || scope === "ALL") {
        columns.push({
            field: "assignedTo",
            headerName: "Assegnato a",
            flex: 1,
            minWidth: 90,
            valueGetter: (_value, row) => fullName(row.assignedTo),
        });
    }

    columns.push({
        field: "actions",
        headerName: "Azioni",
        width: 240,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => renderActions(params.row),
    });

    return columns;
}