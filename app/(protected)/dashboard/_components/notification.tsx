"use client";

import { Box, Button, Card, Divider, List, ListItem, ListItemText, Typography } from "@mui/material";

export type NotificationItem = {
    name: string; // chi ha fatto l'azione
    action: string; // cosa ha fatto
    time: string; // quando
    unread?: boolean;
};

type Props = {
    notifications: NotificationItem[];
    title?: string;
    onMarkAllRead?: () => void; // se assente il pulsante non si vede
};

// Si adatta all'altezza del contenitore: la lista scorre al suo interno
export default function Notifications({ notifications, title = "Notifiche", onMarkAllRead }: Props) {
    return (
        <Card component="aside" variant="outlined" sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <Typography variant="h6" component="h2" sx={{ p: 2 }}>
                {title}
            </Typography>
            <Divider />

            <List disablePadding sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {notifications.map((n, i) => (
                    <Box key={i}>
                        {i > 0 && <Divider />}
                        <ListItem sx={{ gap: 1.5, alignItems: "flex-start" }}>
                            <Box
                                sx={{
                                    mt: 1,
                                    width: 8,
                                    height: 8,
                                    flexShrink: 0,
                                    borderRadius: "50%",
                                    bgcolor: n.unread ? "primary.main" : "transparent",
                                }}
                            />
                            <ListItemText
                                primary={
                                    <>
                                        <strong>{n.name}</strong> {n.action}
                                    </>
                                }
                                secondary={n.time}
                            />
                        </ListItem>
                    </Box>
                ))}
            </List>

            {onMarkAllRead && (
                <>
                    <Divider />
                    <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
                        <Button size="small" onClick={onMarkAllRead}>
                            Segna come lette
                        </Button>
                    </Box>
                </>
            )}
        </Card>
    );
}