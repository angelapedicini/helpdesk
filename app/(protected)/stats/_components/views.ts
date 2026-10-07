import type { DocumentNode } from "graphql";
import type { z } from "zod";
import type { GridColDef } from "@mui/x-data-grid";

import {
    TICKET_STATS_BY_DEPARTMENT_QUERY,
    TICKET_STATS_BY_TECHNICIAN_QUERY,
    TICKET_STATS_BY_CATEGORY_QUERY,
} from "@/apollo-client/queries/stats/stats.queries";
import { NewSchema, TechnicianSchema, CategorySchema } from "@/lib/validators/stat.schema";

import {
    buildDepartmentStatsRows,
    departmentStatsColumns,
    departmentStatsTotal,
} from "./department-stats-columns";
import {
    buildTechnicianStatsRows,
    technicianStatsColumns,
    technicianStatsTotal,
} from "./technician-stats-columns";
import {
    buildCategoryStatsRows,
    categoryStatsColumns,
    categoryStatsTotal,
} from "./category-stats-columns";

export type StatsViewConfig = {
    id: string;
    label: string;
    query: DocumentNode;
    select: (data: any) => any[];
    buildRows: (source: any[]) => any[];
    // colonne condivise da DataGrid (desktop) e CardList (mobile)
    columns: GridColDef<any>[];
    total: (source: any[]) => number;
    schema: z.ZodObject<Record<string, z.ZodType>>;
    chartHeight: number | `${number}vh`;
    viewLabels: {
        all: Record<string, string>;
        ownDepartment: Record<string, string>;
    };
};

const chartHeigth = "65vh";

/*
 * Ogni voce è una "vista" dei dati: solo configurazione (dati/funzioni),
 * nessun componente React. La pagina mostra un unico layout generico
 * guidato dalla voce attiva, quindi ogni nuova vista è un oggetto in più
 * in questo array, senza nuovi componenti.
 */
export const STATS_VIEWS: StatsViewConfig[] = [
    {
        id: "departments",
        label: "Totali ticket",
        query: TICKET_STATS_BY_DEPARTMENT_QUERY,
        select: (data) => data?.ticketStatsByDepartment ?? [],
        columns: departmentStatsColumns,
        buildRows: buildDepartmentStatsRows,
        total: departmentStatsTotal,
        schema: NewSchema,
        chartHeight: chartHeigth,
        viewLabels: {
            all: {
                totali: "Totali per dipartimento",
                media: "Media per dipartimento",
                stati: "Stati per dipartimento",
                ritardi: "Ritardi per dipartimento",
            },
            ownDepartment: {
                stati: "Stati per dipartimento",
                ritardi: "Ritardi per dipartimento",
            },
        },
    },
    {
        id: "technicians",
        label: "Carico per tecnico",
        query: TICKET_STATS_BY_TECHNICIAN_QUERY,
        select: (data) => data?.ticketStatsByTechnician ?? [],
        columns: technicianStatsColumns,
        buildRows: buildTechnicianStatsRows,
        total: technicianStatsTotal,
        schema: TechnicianSchema,
        chartHeight: chartHeigth,
        viewLabels: {
            all: {
                totali: "Totali per tecnico",
                media: "Media per tecnico",
                stati: "Stati per tecnico",
                ritardi: "Ritardi per tecnico",
            },
            ownDepartment: {
                totali: "Totali per tecnico",
                media: "Media per tecnico",
                stati: "Stati per tecnico",
                ritardi: "Ritardi per tecnico",
            },
        },
    },
    {
        id: "categories",
        label: "Categorie più richieste",
        query: TICKET_STATS_BY_CATEGORY_QUERY,
        select: (data: any) => data?.ticketStatsByCategory ?? [],
        columns: categoryStatsColumns,
        buildRows: buildCategoryStatsRows,
        total: categoryStatsTotal,
        schema: CategorySchema,
        chartHeight: chartHeigth,
        viewLabels: {
            all: {
                totali: "Totali per categoria",
                media: "Media per categoria",
                stati: "Stati per categoria",
                ritardi: "Ritardi per categoria",
            },
            ownDepartment: {
                totali: "Totali per categoria",
                media: "Media per categoria",
                stati: "Stati per categoria",
                ritardi: "Ritardi per categoria",
            },
        },
    },
];
