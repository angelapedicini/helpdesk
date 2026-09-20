"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { HeadCell } from "@/components/table";
import { TechnicianStats } from "@/lib/validators/stat.schema";
import type { TicketStatsByTechnicianQuery } from "@/graphql-generated/graphql";

export type TechnicianStatsRow = TechnicianStats & {
    id: string;
};

export type TechnicianStatsSource =
    TicketStatsByTechnicianQuery["ticketStatsByTechnician"];

export function buildTechnicianStatsRows(
    source: TechnicianStatsSource,
): TechnicianStatsRow[] {
    return source.map((item) => ({
        ...item,
        id: item.technicianId,
    }));
}

export function technicianStatsTotal(
    source: TechnicianStatsSource,
): number {
    return source.reduce((sum, row) => sum + row.total, 0);
}

export const technicianStatsHeadCells: HeadCell<TechnicianStatsRow>[] = [
    {
        id: "technicianId",
        label: "Tecnico",
        sortable: false,
        render: (row) => (
            <Typography variant="body2" noWrap>
                {row.label}
            </Typography>
        ),
    },
    {
        id: "total",
        label: "Totale",
        sortable: false,
    },
    {
        id: "open",
        label: "Open",
        sortable: false,
    },
    {
        id: "assigned",
        label: "Assegnati",
        sortable: false,
    },
    {
        id: "inProgress",
        label: "In lavorazione",
        sortable: false,
    },
    {
        id: "closed",
        label: "Chiusi",
        sortable: false,
    },
    {
        id: "refused",
        label: "Rifiutati",
        sortable: false,
    },
    {
        id: "firstResponseLate",
        label: "Prima risposta in ritardo",
        sortable: false,
    },
    {
        id: "dueDateLate",
        label: "Chiusi oltre dueDate",
        sortable: false,
    },
    {
        id: "average",
        label: "Tempo medio risoluzione",
        sortable: false,
        render: (row) =>
            row.average > 0 ? `${row.average.toFixed(1)} ore` : "n/d",
    },
];
