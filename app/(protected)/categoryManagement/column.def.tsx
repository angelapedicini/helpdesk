// app/(protected)/categoryManagement/column.def.tsx
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import {
    CategoriesQuery,
    CategoryAccessesQuery,
} from "@/graphql-generated/graphql";
import { HeadCell } from "@/components/table";
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

const ACCESS_COLUMNS: {
    department: Department;
    key: keyof CategoryManagementRowWithAccess;
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

function renderAccessRole(key: keyof CategoryManagementRowWithAccess) {
    return function AccessRoleCell(row: CategoryManagementRowWithAccess) {
        const role = row[key] as Role | null | undefined;
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
    };
}

export function createCategoryHeadCells(
    accesses: CategoryAccessesQuery["categoryAccesses"],
    options: { includeAccessColumns: boolean } = { includeAccessColumns: true }
): HeadCell<CategoryManagementRowWithAccess>[] {
    const baseCells: HeadCell<CategoryManagementRowWithAccess>[] = [
        { id: "name", label: "Nome" },
        {
            id: "department",
            label: "Dipartimento",
            render: (cat) => {
                const config = DEPARTMENT_CONFIG[cat.department];
                if (!config) return cat.department;
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
            id: "specificField",
            label: "Campo specifico",
            render: (cat) =>
                cat.specificField
                    ? SPECIFIC_FIELD_LABELS[cat.specificField] ?? cat.specificField
                    : "—",
        },
        {
            id: "disabled",
            label: "Stato",
            render: (cat) =>
                cat.disabled ? (
                    <Chip label="Disabilitata" color="error" size="small" />
                ) : (
                    <Chip label="Attiva" color="success" size="small" />
                ),
        },
    ];

    if (!options.includeAccessColumns) {
        return baseCells;
    }

    const accessCells: HeadCell<CategoryManagementRowWithAccess>[] =
        ACCESS_COLUMNS.map(({ department, key }) => ({
            id: key,
            label: `${DEPARTMENT_CONFIG[department]?.label ?? department}`,
            render: renderAccessRole(key),
        }));

    return [...baseCells, ...accessCells];
}