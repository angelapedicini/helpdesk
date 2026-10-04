"use client";

import type { ElementType, ReactNode } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { GridColDef } from "@mui/x-data-grid";

import type { UsersManagementQuery } from "@/graphql-generated/graphql";

import { ROLE_CONFIG } from "@/components/enums/role.config";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";

export type UserManagementRow = UsersManagementQuery["usersForManagement"][number];
type Row = UserManagementRow;

type UserManagementColumnsOptions = {
    renderActions: (user: Row) => ReactNode;
};

// Icona + etichetta colorata, usata da dipartimento / ruolo
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

// Lista non ordinabile né filtrabile: i dati arrivano già ristretti dal BE
// (ruolo + filtri della sidebar) e il filtro del grid sarebbe un doppione.
// Le stesse colonne sono usate dal DataGrid (desktop) e dalla CardList (mobile).
const base: Partial<GridColDef<Row>> = {
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
};

export function createUserManagementColumns({
    renderActions,
}: UserManagementColumnsOptions): GridColDef<Row>[] {
    return [
        { ...base, field: "id", headerName: "ID", width: 70 },
        { ...base, field: "firstName", headerName: "Nome", flex: 1, minWidth: 100 },
        { ...base, field: "lastName", headerName: "Cognome", flex: 1, minWidth: 100 },
        {
            ...base,
            field: "department",
            headerName: "Dipartimento",
            flex: 1,
            minWidth: 120,
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
            field: "role",
            headerName: "Ruolo",
            flex: 1,
            minWidth: 110,
            renderCell: (params) => {
                const config = ROLE_CONFIG[params.row.role];
                return (
                    <IconLabel icon={config.icon} color={config.color} label={config.label} />
                );
            },
        },
        {
            ...base,
            field: "specializations",
            headerName: "Specializzazioni",
            flex: 2,
            minWidth: 180,
            renderCell: (params) =>
                params.row.specializations.length === 0 ? (
                    "Nessuna categoria"
                ) : (
                    <Stack
                        direction="row"
                        sx={{
                            flexWrap: "wrap",
                            gap: 0.5,
                            alignContent: "center",
                            height: "100%",
                            overflow: "hidden",
                        }}
                    >
                        {params.row.specializations.map((s) => (
                            <Chip key={s.id} label={s.name} size="small" />
                        ))}
                    </Stack>
                ),
        },
        {
            ...base,
            field: "actions",
            headerName: "Azioni",
            width: 152,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => renderActions(params.row),
        },
    ];
}