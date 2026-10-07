"use client";

import type { ElementType } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { GridColDef } from "@mui/x-data-grid";

import { CategoryStats } from "@/lib/validators/stat.schema";
// I tipi sono generati da GraphQL Code Generator; dopo `npm run codegen` saranno disponibili
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CategoryStatsRow = CategoryStats & {
  id: string;
  name: string;
  label: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CategoryStatsSource = any[];

export function buildCategoryStatsRows(
  source: CategoryStatsSource,
): CategoryStatsRow[] {
  return source.map((item: any) => ({
    ...item,
    id: String(item.categoryId),
    label: item.name,
    name: item.name,
  }));
}

export function categoryStatsTotal(source: CategoryStatsSource): number {
  return source.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
}

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

const base: Partial<GridColDef<CategoryStatsRow>> = {
  flex: 1,
  minWidth: 90,
};

const numeric: Partial<GridColDef<CategoryStatsRow>> = {
  ...base,
  type: "number",
  align: "left",
  headerAlign: "left",
};

export const categoryStatsColumns: GridColDef<CategoryStatsRow>[] = [
  {
    ...base,
    field: "name",
    headerName: "Categoria",
    flex: 2,
    minWidth: 160,
    renderCell: (params) => params.row.name,
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
    valueFormatter: (value: number) =>
      value > 0 ? `${value.toFixed(1)} ore` : "n/d",
  },
];
