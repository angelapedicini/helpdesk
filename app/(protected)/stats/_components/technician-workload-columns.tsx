// modules/ticket-stats/_components/technician-workload-columns.tsx
"use client";

import { HeadCell } from "@/components/table";
import { TechnicianWorkloadStat } from "@/lib/validators/stat.schema";

export type TechnicianWorkloadStatRow = TechnicianWorkloadStat & { id: number };

function formatAvg(sum: number, count: number): string {
  return count > 0 ? `${(sum / count).toFixed(1)} ore` : "n/d";
}

export const technicianWorkloadHeadCells: HeadCell<TechnicianWorkloadStatRow>[] = [
  {
    id: "firstName",
    label: "Tecnico",
    sortable: false,
    render: (row) => `${row.firstName} ${row.lastName}`,
  },
  { id: "role", label: "Ruolo", sortable: false },
  { id: "department", label: "Dipartimento", sortable: false },
  { id: "pendingReviewCount", label: "Assegnati", sortable: false },
  { id: "activeCount", label: "In lavorazione", sortable: false },
  { id: "overdueCount", label: "In ritardo", sortable: false },
  { id: "closedThisPeriod", label: "Chiusi", sortable: false },
  {
    id: "avgResolutionHours",
    label: "Tempo medio risoluzione",
    sortable: false,
    render: (row) =>
      formatAvg(row.sumResolutionHours, row.closedWithResolutionCount),
  },
];