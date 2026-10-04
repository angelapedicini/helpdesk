"use client";

import type { ElementType } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { GridColDef } from "@mui/x-data-grid";

import { New } from "@/lib/validators/stat.schema";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { Department } from "@/lib/validators/enums.schema";
import type { TicketStatsByDepartmentQuery } from "@/graphql-generated/graphql";

export type DepartmentStatsRow = New & {
    id: string;
};

export type DepartmentStatsSource =
    TicketStatsByDepartmentQuery["ticketStatsByDepartment"];

export function buildDepartmentStatsRows(
    source: DepartmentStatsSource,
): DepartmentStatsRow[] {
    return source.map((item) => ({
        ...item,
        id: item.department,
    }));
}

export function departmentStatsTotal(source: DepartmentStatsSource): number {
    return source.reduce((sum, row) => sum + row.total, 0);
}

// Icona + etichetta colorata
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

// Dati completi sul client: ordinamento e filtri nativi del grid attivi.
// Le stesse colonne sono usate dal DataGrid (desktop) e dalla CardList (mobile).
const base: Partial<GridColDef<DepartmentStatsRow>> = {
    flex: 1,
    minWidth: 90,
};

// numeri: tipo "number" per ordine e filtri corretti, allineati a sinistra
// come le altre tabelle
const numeric: Partial<GridColDef<DepartmentStatsRow>> = {
    ...base,
    type: "number",
    align: "left",
    headerAlign: "left",
};

export const departmentStatsColumns: GridColDef<DepartmentStatsRow>[] = [
    {
        ...base,
        field: "department",
        headerName: "Dipartimento",
        flex: 2,
        minWidth: 120,
        // ordina e filtra sull'etichetta mostrata, non sul codice
        valueGetter: (_value, row) =>
            DEPARTMENT_CONFIG[row.department as Department]?.label ?? row.department,
        renderCell: (params) => {
            const config = DEPARTMENT_CONFIG[params.row.department as Department];
            if (!config) return params.row.department;
            return (
                <IconLabel icon={config.icon} color={config.color} label={config.label} />
            );
        },
    },
    { ...numeric, field: "total", headerName: "Totale" },
    { ...numeric, field: "open", headerName: "Open" },
    { ...numeric, field: "assigned", headerName: "Assegnati" },
    { ...numeric, field: "inProgress", headerName: "In lavorazione" },
    { ...numeric, field: "closed", headerName: "Chiusi" },
    { ...numeric, field: "refused", headerName: "Rifiutati" },
    { ...numeric, field: "firstResponseLate", headerName: "Prima risposta in ritardo" },
    { ...numeric, field: "dueDateLate", headerName: "Chiusi oltre dueDate" },
    { ...numeric, field: "closedOnTime", headerName: "Chiusi nei tempi" },
    { ...numeric, field: "openAssignedLate", headerName: "Open/Assegnati oltre scadenza" },
    {
        ...numeric,
        field: "average",
        headerName: "Tempo medio risoluzione",
        // ordina e filtra sul numero, mostra il testo formattato
        valueFormatter: (value: number) =>
            value > 0 ? `${value.toFixed(1)} ore` : "n/d",
    },
];