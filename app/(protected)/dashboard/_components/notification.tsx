"use client";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import type { ResultOf } from "@graphql-typed-document-node/core";

import { NAV_NOTIFICATIONS } from "@/apollo-client/queries/ticket-notification/ticket-notification.queries";
import { fmtRelative } from "@/lib/helper/formt-helpers";

type NavNotificationsData = ResultOf<typeof NAV_NOTIFICATIONS>;
export type UnreadTicketMessage = NavNotificationsData["unreadTicketMessages"][number];
export type TicketNotification = NavNotificationsData["ticketNotifications"][number];

export const TICKET_NOTIFICATION_LABELS: Record<TicketNotification["type"], string> = {
    NEWTICKET: "Nuovo ticket",
    STATUS_CHANGED: "Stato cambiato",
    ASSIGNED: "Assegnazione",
    CATEGORY_CHANGED: "Categoria cambiata",
    PRIORITY_CHANGED: "Priorità cambiata",
    DATES_CHANGED: "Scadenze aggiornate",
};

interface TicketNotificationsListProps {
    unread: readonly UnreadTicketMessage[];
    notifications: readonly TicketNotification[];
    onOpenUnread?: (ticketId: number) => void;
    onOpenNotification?: (ticketId: number) => void;
}

export default function TicketNotificationsList({
    unread,
    notifications,
    onOpenUnread,
    onOpenNotification,
}: TicketNotificationsListProps) {
    if (unread.length + notifications.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                Nessuna notifica
            </Typography>
        );
    }

    return (
        <List dense disablePadding>
            {unread.length > 0 && (
                <>
                    <ListSubheader sx={{ fontWeight: 700, lineHeight: "32px" }}>Messaggi non letti</ListSubheader>
                    {unread.map((u) => (
                        <ListItemButton key={`unread-${u.ticketId}`} onClick={() => onOpenUnread?.(u.ticketId)}>
                            <ListItemText
                                primary={`Ticket #${u.ticketId} — ${u.count} nuovi messaggi`}
                                secondary={fmtRelative(u.lastMessageAt)}
                            />
                        </ListItemButton>
                    ))}
                </>
            )}

            {notifications.length > 0 && (
                <>
                    <ListSubheader sx={{ fontWeight: 700, lineHeight: "32px" }}>Notifiche</ListSubheader>
                    {notifications.map((n) => (
                        <ListItemButton key={n.id} onClick={() => onOpenNotification?.(n.ticket.id)}>
                            <ListItemText
                                primary={`Ticket #${n.ticket.id} — ${TICKET_NOTIFICATION_LABELS[n.type]}`}
                                secondary={fmtRelative(n.updatedAt)}
                            />
                        </ListItemButton>
                    ))}
                </>
            )}
        </List>
    );
}