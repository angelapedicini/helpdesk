"use client";

import type { GridColDef } from "@mui/x-data-grid";

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

// Dati completi sul client: ordinamento e filtri nativi del grid attivi.
// Le stesse colonne sono usate dal DataGrid (desktop) e dalla CardList (mobile).
const base: Partial<GridColDef<TechnicianStatsRow>> = {
    flex: 1,
    minWidth: 90,
};

// numeri: tipo "number" per ordine e filtri corretti, allineati a sinistra
// come le altre tabelle
const numeric: Partial<GridColDef<TechnicianStatsRow>> = {
    ...base,
    type: "number",
    align: "left",
    headerAlign: "left",
};

export const technicianStatsColumns: GridColDef<TechnicianStatsRow>[] = [
    // il nome del tecnico sta in `label`; `technicianId` è già l'id della riga
    { ...base, field: "label", headerName: "Tecnico", flex: 2, minWidth: 120 },
    { ...numeric, field: "total", headerName: "Totale" },
    { ...numeric, field: "open", headerName: "Open" },
    { ...numeric, field: "assigned", headerName: "Assegnati" },
    { ...numeric, field: "inProgress", headerName: "In lavorazione" },
    { ...numeric, field: "closed", headerName: "Chiusi" },
    { ...numeric, field: "refused", headerName: "Rifiutati" },
    { ...numeric, field: "firstResponseLate", headerName: "Prima risposta in ritardo" },
    { ...numeric, field: "dueDateLate", headerName: "Chiusi oltre dueDate" },
    {
        ...numeric,
        field: "average",
        headerName: "Tempo medio risoluzione",
        valueFormatter: (value: number) =>
            value > 0 ? `${value.toFixed(1)} ore` : "n/d",
    },
];