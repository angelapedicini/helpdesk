// app/(protected)/userCategory/_components/actions.tsx
"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import EditIcon from "@mui/icons-material/Edit";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import DeleteIcon from "@mui/icons-material/Delete";

import type { UserManagementRow } from "../column.def";
import { useUserManagementPermissions } from "@/lib/casl/abilities/user/hook-permission";

interface UserManagementRowActionsProps {
    user: UserManagementRow;
    onAddSpec?: (user: UserManagementRow) => void;
    onRemoveSpec?: (user: UserManagementRow) => void;
    onEditRole?: (user: UserManagementRow) => void;
}

export default function UserManagementRowActions({
    user,
    onAddSpec,
    onRemoveSpec,
    onEditRole,
}: UserManagementRowActionsProps) {
    const { canManageSpecialization, canUpdateRole } = useUserManagementPermissions();

    return (
        <>
            {canManageSpecialization(user) && onAddSpec && onRemoveSpec && (
                <>
                    <Tooltip title="Assegna specializzazione" arrow>
                        <IconButton
                            color="primary"
                            onClick={() => onAddSpec(user)}
                            aria-label="Assegna specializzazione"
                        >
                            <ControlPointIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Rimuovi specializzazione" arrow>
                        <IconButton
                            color="error"
                            onClick={() => onRemoveSpec(user)}
                            aria-label="Rimuovi specializzazione"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )}

            {canUpdateRole(user) && onEditRole && (
                <Tooltip title="Cambia ruolo" arrow>
                    <IconButton
                        color="primary"
                        onClick={() => onEditRole(user)}
                        aria-label="Cambia ruolo"
                    >
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            )}
        </>
    );
}