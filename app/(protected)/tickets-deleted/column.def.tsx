"use client";

import type { ElementType, ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { GridColDef } from "@mui/x-data-grid";

import type { TicketHistoryFieldsFragment } from "@/graphql-generated/graphql";

import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";

export type DeletedTicketRow = TicketHistoryFieldsFragment;
type Row = DeletedTicketRow;

type DeletedTicketColumnsOptions = {
    renderActions: (row: Row) => ReactNode;
};

// Icona + etichetta colorata, usata da stato / priorità / dipartimento
function IconLabel({
    icon: Icon,
    color,
    label,
}: {
    icon: ElementType;
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

const toDate = (value?: string | null) => (value ? new Date(value) : null);

const formatDate = (value: Date | null) =>
    value ? value.toLocaleDateString("it-IT") : "-";

const personName = (
    user: { firstName: string; lastName: string } | null | undefined,
    fallback: string
) => (user ? `${user.firstName} ${user.lastName}` : fallback);

// Lista non ordinabile né filtrabile: l'ordine è deciso dal BE e il filtro
// del grid agirebbe solo sulle righe già caricate, dando risultati fuorvianti.
// Le stesse colonne sono usate dal DataGrid (desktop) e dalla CardList (mobile).
const base: Partial<GridColDef<Row>> = {
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
};

export function createDeletedTicketColumns({
    renderActions,
}: DeletedTicketColumnsOptions): GridColDef<Row>[] {
    return [
        {
            ...base,
            field: "originalTicketId",
            headerName: "Ticket originale",
            width: 130,
        },
        { ...base, field: "title", headerName: "Titolo", flex: 2, minWidth: 120 },
        {
            ...base,
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
            ...base,
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
            ...base,
            field: "category",
            headerName: "Categoria",
            flex: 1,
            minWidth: 90,
            valueGetter: (_value, row) => row.category?.name ?? "Nessuna categoria",
        },
        {
            ...base,
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
            ...base,
            field: "createdBy",
            headerName: "Creato da",
            flex: 1,
            minWidth: 90,
            valueGetter: (_value, row) => personName(row.createdBy, "-"),
        },
        {
            ...base,
            field: "assignedTo",
            headerName: "Assegnato a",
            flex: 1,
            minWidth: 90,
            valueGetter: (_value, row) => personName(row.assignedTo, "Non assegnato"),
        },
        {
            ...base,
            field: "deletedBy",
            headerName: "Eliminato da",
            flex: 1,
            minWidth: 90,
            valueGetter: (_value, row) => personName(row.deletedBy, "-"),
        },
        {
            ...base,
            field: "deletedAt",
            headerName: "Eliminato il",
            type: "date",
            flex: 1,
            minWidth: 90,
            valueGetter: (value) => toDate(value),
            valueFormatter: formatDate,
        },
        {
            ...base,
            field: "actions",
            headerName: "Azioni",
            width: 80,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => renderActions(params.row),
        },
    ];
}