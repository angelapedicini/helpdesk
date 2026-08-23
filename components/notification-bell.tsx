// components/ticket/ticket-notification-bell.tsx
"use client";

import { IconButton, Tooltip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";

interface NotificationBellProps {
    isSubscribed: boolean;
    busy: boolean;
    onToggle: () => void;
}

export default function NotificationBell({
    isSubscribed,
    busy,
    onToggle,
}: NotificationBellProps) {
    return (
        <Tooltip title={isSubscribed ? "Disattiva notifiche" : "Attiva notifiche"} arrow>
            <span>
                <IconButton onClick={onToggle} disabled={busy} aria-label="Notifiche ticket">
                    {isSubscribed ? <NotificationsIcon color="primary" /> : <NotificationsOffIcon />}
                </IconButton>
            </span>
        </Tooltip>
    );
}