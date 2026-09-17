// app/(protected)/userCategory/column.def.tsx
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { UsersManagementQuery } from "@/graphql-generated/graphql";
import { HeadCell } from "@/components/table";
import { ROLE_CONFIG } from "@/components/enums/role.config";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";

export type UserManagementRow = UsersManagementQuery["searchUsers"][number];

export function createUserManagementHeadCells(): HeadCell<UserManagementRow>[] {
    return [
        { id: "id", label: "ID", width: "75px" },
        { id: "firstName", label: "Nome" },
        { id: "lastName", label: "Cognome" },
        {
            id: "department",
            label: "Dipartimento",
            render: (user) => {
                const config = DEPARTMENT_CONFIG[user.department];
                if (!config) return user.department;
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
            id: "role",
            label: "Ruolo",
            render: (user) => {
                const config = ROLE_CONFIG[user.role];
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
            id: "specializations",
            label: "Specializzazioni",
            sortable: false,
            render: (user) =>
                user.specializations.length === 0 ? (
                    "Nessuna categoria"
                ) : (
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                        {user.specializations.map((s) => (
                            <Chip key={s.id} label={s.name} size="small" />
                        ))}
                    </Stack>
                ),
        },
    ];
}