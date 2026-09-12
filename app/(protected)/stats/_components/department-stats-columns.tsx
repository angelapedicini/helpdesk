// modules/ticket-stats/_components/department-stats-columns.tsx
"use client";

import { HeadCell } from "@/components/table";
import { TicketDepartmentStat } from "@/lib/validators/stat.schema";

export type TicketDepartmentStatRow = TicketDepartmentStat & { id: string };

function formatAvg(sum: number, count: number): string {
  return count > 0 ? `${(sum / count).toFixed(1)} ore` : "n/d";
}

export const departmentStatsHeadCells: HeadCell<TicketDepartmentStatRow>[] = [
  { id: "department", label: "Dipartimento", sortable: false },
  { id: "totalTickets", label: "Totale", sortable: false },
  { id: "openCount", label: "Open", sortable: false },
  { id: "pendingReviewCount", label: "Assegnati", sortable: false },
  { id: "inProgressCount", label: "In lavorazione", sortable: false },
  { id: "closedCount", label: "Chiusi", sortable: false },
  { id: "refusedCount", label: "Rifiutati", sortable: false },
  { id: "overdueCount", label: "In ritardo", sortable: false },
  {
    id: "avgResolutionHours",
    label: "Tempo medio risoluzione",
    sortable: false,
    render: (row) =>
      formatAvg(row.sumResolutionHours, row.closedWithResolutionCount),
  },
];