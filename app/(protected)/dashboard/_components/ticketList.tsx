"use client";

import Link from "next/link";
import { Box, Card, Chip, Divider, List, ListItemButton, ListItemText, Typography } from "@mui/material";

export type TicketItem = {
    id: number;
    title: string;
    date: string;
    status: string;
};

type Props = {
    title: string;
    tickets: TicketItem[];
};

const STATUS_COLOR: Record<string, "default" | "warning" | "info" | "success"> = {
    Aperto: "info",
    "In lavorazione": "warning",
    Riaperto: "warning",
    Chiuso: "success",
};

export default function TicketList({ title, tickets }: Props) {
    return (
        <Box component="section">
            <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
                {title}
            </Typography>

            <Card variant="outlined">
                {tickets.length === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 2 }}>
                        Nessun ticket da mostrare.
                    </Typography>
                ) : (
                    <List disablePadding>
                        {tickets.map((t, i) => (
                            <Box key={t.id}>
                                {i > 0 && <Divider />}
                                <ListItemButton
                                    component={Link}
                                    href={`/tickets/${t.id}`}
                                    sx={{
                                        gap: { xs: 0.75, sm: 1.5 },
                                        // su mobile il chip dello stato va a capo
                                        flexDirection: { xs: "column", sm: "row" },
                                        alignItems: { xs: "flex-start", sm: "center" },
                                    }}
                                >
                                    <ListItemText
                                        primary={t.title}
                                        secondary={`#${t.id} - ${t.date}`}
                                        slotProps={{ primary: { noWrap: true } }}
                                        sx={{ minWidth: 0, width: { xs: "100%", sm: "auto" }, m: 0 }}
                                    />
                                    <Chip size="small" label={t.status} color={STATUS_COLOR[t.status] ?? "default"} variant="outlined" />
                                </ListItemButton>
                            </Box>
                        ))}
                    </List>
                )}
            </Card>
        </Box>
    );
}