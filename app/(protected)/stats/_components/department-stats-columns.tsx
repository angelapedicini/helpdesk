"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { HeadCell } from "@/components/table";
import { New } from "@/lib/validators/stat.schema";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { Department } from "@/lib/validators/enums.schema";

export type DepartmentStatsRow = New & {
  id: string;
};

export const departmentStatsHeadCells: HeadCell<DepartmentStatsRow>[] = [
  {
    id: "department",
    label: "Dipartimento",
    sortable: false,
    render: (row) => {
      const config = DEPARTMENT_CONFIG[row.department as Department];
      if (!config) return row.department;
      const Icon = config.icon;
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon sx={{ color: config.color, fontSize: 20 }} />
          <Typography component="span" sx={{ color: config.color }}>
            {config.label}
          </Typography>
        </Box>
      );
    },
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
