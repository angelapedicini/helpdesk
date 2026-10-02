// components/ticket/ticket-row-actions.tsx
"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import EditSquareIcon from '@mui/icons-material/EditSquare';
import EditIcon from '@mui/icons-material/Edit';
import MessageIcon from '@mui/icons-material/Message';

import type { TicketFieldsFragment, TicketScope } from "@/graphql-generated/graphql";
import { useTicketDeletePermission, useTicketUpdatePermissions } from "@/lib/casl/abilities/ticket/hook-permission";

interface TicketRowActionsProps {
    ticket: TicketFieldsFragment;
    scope: TicketScope;
    onOpen?: (ticket: TicketFieldsFragment) => void;
    onQuickUpdate?: (ticket: TicketFieldsFragment) => void;
    onHistory?: (ticket: TicketFieldsFragment) => void;
    onDelete?: (ticket: TicketFieldsFragment) => void;
    onMessage?: (ticket: TicketFieldsFragment) => void;
}

export default function TicketRowActions({
    ticket,
    scope,
    onOpen,
    onQuickUpdate,
    onHistory,
    onDelete,
    onMessage,
}: TicketRowActionsProps) {
    const canDelete = useTicketDeletePermission(ticket);
    const { hasAnyEditableField } = useTicketUpdatePermissions(ticket);

    return (
        <>
            {onOpen && (
                <Tooltip title="Apri ticket" arrow>
                    <IconButton color="primary" onClick={() => onOpen(ticket)} aria-label="Apri ticket">
                        <EditSquareIcon />
                    </IconButton>
                </Tooltip>
            )}

            {onQuickUpdate && hasAnyEditableField && (
                <Tooltip title="Modifica rapida" arrow>
                    <IconButton color="success" onClick={() => onQuickUpdate(ticket)} aria-label="Modifica rapida">
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            )}

            {onHistory && (
                <Tooltip title="Storico ticket" arrow>
                    <IconButton color="info" onClick={() => onHistory(ticket)} aria-label="Storico ticket">
                        <HistoryIcon />
                    </IconButton>
                </Tooltip>
            )}

            {onMessage && (
                <Tooltip title="Messaggi" arrow>
                    <IconButton color="info" onClick={() => onMessage(ticket)} aria-label="Messaggi">
                        <MessageIcon />
                    </IconButton>
                </Tooltip>
            )}

            {scope === "MINE" && canDelete && onDelete && (
                <Tooltip title="Elimina ticket" arrow>
                    <IconButton color="error" onClick={() => onDelete(ticket)} aria-label="Elimina ticket">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )}
        </>
    );
}