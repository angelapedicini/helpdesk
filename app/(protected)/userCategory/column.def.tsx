// @/lib/user/column.def.tsx
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import { UsersByDepartmentQuery } from "@/apollo-client/gql/graphql";
import { HeadCell } from "@/components/table";

export type UserDepartmentRow = UsersByDepartmentQuery["usersByDepartment"][number];

const ROLE_LABEL: Record<UserDepartmentRow["role"], string> = {
    ADMIN: "Admin",
    TECHNICIAN: "Tecnico",
    EMPLOYEE: "Dipendente",
};

export function createUserDepartmentHeadCells(): HeadCell<UserDepartmentRow>[] {
    return [
        { id: "id", label: "ID", width: "75px" },
        { id: "firstName", label: "Nome" },
        { id: "lastName", label: "Cognome" },

        {
            id: "role",
            label: "Ruolo",
            render: (user) => ROLE_LABEL[user.role],
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