"use client";

import { HeadCell } from "@/components/table";
import { New } from "@/lib/validators/stat.schema";

export type DepartmentStatsRow = New & {
  id: string;
};

export const departmentStatsHeadCells: HeadCell<DepartmentStatsRow>[] = [
  {
    id: "department",
    label: "Dipartimento",
    sortable: false,
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
    id: "average",
    label: "Tempo medio risoluzione",
    sortable: false,
    render: (row) =>
      row.average > 0 ? `${row.average.toFixed(1)} ore` : "n/d",
  },
];
