// app/(protected)/categoryManagement/column.def.tsx
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { CategoriesQuery } from "@/graphql-generated/graphql";
import { HeadCell } from "@/components/table";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";

export type CategoryManagementRow = CategoriesQuery["categories"][number];

export function createCategoryHeadCells(): HeadCell<CategoryManagementRow>[] {
    return [
        { id: "id", label: "ID", width: "75px" },
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
            render: (cat) => cat.specificField ?? "—",
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
}