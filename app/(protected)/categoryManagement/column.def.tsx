"use client";

import type { ElementType, ReactNode } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { GridColDef } from "@mui/x-data-grid";

import type {
    CategoriesQuery,
    CategoryAccessesQuery,
} from "@/graphql-generated/graphql";

import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { ROLE_CONFIG } from "@/components/enums/role.config";
import { SPECIFIC_FIELD_LABELS } from "@/lib/config/ticket-specific-field.config";
import type { Department, Role } from "@/lib/validators/enums.schema";

export type CategoryManagementRow = CategoriesQuery["categories"][number];

export type CategoryManagementRowWithAccess = CategoryManagementRow & {
    accessFinance: Role | null;
    accessHr: Role | null;
    accessIt: Role | null;
    accessLogistic: Role | null;
    accessSupport: Role | null;
};

type Row = CategoryManagementRowWithAccess;

type CategoryColumnsOptions = {
    renderActions: (row: Row) => ReactNode;
    includeAccessColumns?: boolean;
};

const ACCESS_COLUMNS: {
    department: Department;
    key: "accessFinance" | "accessHr" | "accessIt" | "accessLogistic" | "accessSupport";
}[] = [
    { department: "FINANCE", key: "accessFinance" },
    { department: "HR", key: "accessHr" },
    { department: "IT", key: "accessIt" },
    { department: "LOGISTIC", key: "accessLogistic" },
    { department: "SUPPORT", key: "accessSupport" },
];

export function getCategoryAccessMatrix(
    categoryId: number,
    accesses: CategoryAccessesQuery["categoryAccesses"]
): Partial<Record<Department, Role>> {
    const grants = accesses.filter(
        (access) => access.categoryId === categoryId && !access.disabled
    );

    const matrix: Partial<Record<Department, Role>> = {};

    for (const department of ACCESS_COLUMNS.map((column) => column.department)) {
        const specific = grants.find(
            (access) => access.requesterDepartment === department
        );
        const wildcard = grants.find(
            (access) => access.requesterDepartment === null
        );
        const grant = specific ?? wildcard;
        if (grant) {
            matrix[department] = grant.requesterMinRole;
        }
    }

    return matrix;
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

// Dati completi sul client: l'ordinamento nativo del grid è attivo, il filtro
// no (non serve). Le stesse colonne sono usate dal DataGrid (desktop) e dalla
// CardList (mobile).
const base: Partial<GridColDef<Row>> = {
    filterable: false,
    flex: 1,
    minWidth: 90,
};

export function createCategoryColumns({
    renderActions,
    includeAccessColumns = true,
}: CategoryColumnsOptions): GridColDef<Row>[] {
    const baseColumns: GridColDef<Row>[] = [
        { ...base, field: "name", headerName: "Nome", flex: 2, minWidth: 120 },
        {
            ...base,
            field: "department",
            headerName: "Dipartimento",
            minWidth: 120,
            // ordina sull'etichetta mostrata, non sul codice
            valueGetter: (_value, row) =>
                DEPARTMENT_CONFIG[row.department]?.label ?? row.department,
            renderCell: (params) => {
                const config = DEPARTMENT_CONFIG[params.row.department];
                if (!config) return params.row.department;
                return (
                    <IconLabel icon={config.icon} color={config.color} label={config.label} />
                );
            },
        },
        {
            ...base,
            field: "specificField",
            headerName: "Campo specifico",
            minWidth: 120,
            valueGetter: (_value, row) =>
                row.specificField
                    ? SPECIFIC_FIELD_LABELS[row.specificField] ?? row.specificField
                    : "—",
        },
        {
            ...base,
            field: "disabled",
            headerName: "Stato",
            valueGetter: (_value, row) => (row.disabled ? "Disabilitata" : "Attiva"),
            renderCell: (params) =>
                params.row.disabled ? (
                    <Chip label="Disabilitata" color="error" size="small" />
                ) : (
                    <Chip label="Attiva" color="success" size="small" />
                ),
        },
    ];

    const accessColumns: GridColDef<Row>[] = includeAccessColumns
        ? ACCESS_COLUMNS.map(({ department, key }) => ({
              ...base,
              field: key,
              headerName: DEPARTMENT_CONFIG[department]?.label ?? department,
              minWidth: 110,
              // ordina sull'etichetta del ruolo
              valueGetter: (_value: unknown, row: Row) => {
                  const role = row[key];
                  return role ? ROLE_CONFIG[role].label : "—";
              },
              renderCell: (params) => {
                  const role = params.row[key];
                  if (!role) {
                      return (
                          <Typography variant="body2" color="text.secondary">
                              —
                          </Typography>
                      );
                  }
                  const roleConfig = ROLE_CONFIG[role];
                  const Icon = roleConfig.icon;
                  return (
                      <Chip
                          size="small"
                          variant="outlined"
                          icon={<Icon sx={{ color: roleConfig.color, fontSize: 16 }} />}
                          label={roleConfig.label}
                      />
                  );
              },
          }))
        : [];

    return [
        ...baseColumns,
        ...accessColumns,
        {
            field: "actions",
            headerName: "Azioni",
            width: 120,
            align: "center",
            headerAlign: "center",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => renderActions(params.row),
        },
    ];
}