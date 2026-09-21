import type { DocumentNode } from "graphql";
import type { z } from "zod";
import type { HeadCell } from "@/components/table";

import { TICKET_STATS_BY_DEPARTMENT_QUERY } from "@/apollo-client/queries/stats/stats.queries";
import { TICKET_STATS_BY_TECHNICIAN_QUERY } from "@/apollo-client/queries/stats/stats.queries";
import { NewSchema, TechnicianSchema } from "@/lib/validators/stat.schema";

import {
    buildDepartmentStatsRows,
    departmentStatsHeadCells,
    departmentStatsTotal,
} from "./department-stats-columns";
import {
    buildTechnicianStatsRows,
    technicianStatsHeadCells,
    technicianStatsTotal,
} from "./technician-stats-columns";

export type StatsViewConfig = {
    id: string;
    label: string;
    query: DocumentNode;
    select: (data: any) => any[];
    buildRows: (source: any[]) => any[];
    headCells: readonly HeadCell<any>[];
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
        headCells: departmentStatsHeadCells,
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
        headCells: technicianStatsHeadCells,
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
];