"use client";

import Link from "next/link";
import { Box, Card, CardActionArea, Divider, Stack, Typography } from "@mui/material";

export type CounterItem = {
    value: number;
    label: string;
    tone?: "error" | "warning" | "info"; // colore del numero se > 0
    href?: string; // se presente la card è cliccabile
};

export type CounterGroup = {
    title: string;
    items: CounterItem[];
};

// Altezza del riquadro da md in su: un gruppo = basso, più gruppi = alto
const HEIGHT_SINGLE = 200;
const HEIGHT_MULTI = "33vh";

function CounterCard({ item, compact }: { item: CounterItem; compact: boolean }) {
    const boxSx = {
        p: compact ? 1 : 1.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
    } as const;

    const content = (
        <>
            <Typography
                variant={compact ? "h5" : "h4"}
                sx={{
                    fontWeight: 600,
                    lineHeight: 1.1,
                    fontSize: compact ? "1.6rem" : undefined,
                    color: item.value > 0 && item.tone ? `${item.tone}.main` : item.value > 0 ? "text.primary" : "text.disabled",
                }}
            >
                {item.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {item.label}
            </Typography>
        </>
    );

    return (
        <Card variant="outlined" sx={{ minHeight: 0 }}>
            {item.href ? (
                <CardActionArea component={Link} href={item.href} sx={boxSx}>
                    {content}
                </CardActionArea>
            ) : (
                <Box sx={boxSx}>{content}</Box>
            )}
        </Card>
    );
}

export default function Counters({ groups }: { groups: CounterGroup[] }) {
    const compact = groups.length > 1;

    return (
        <Card
            component="section"
            variant="outlined"
            sx={{
                p: compact ? 2 : { xs: 2, md: 2.5 },
                height: { md: compact ? HEIGHT_MULTI : HEIGHT_SINGLE },
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
            }}
        >
            <Stack spacing={compact ? 1 : 2.5} divider={<Divider flexItem />} sx={{ flex: 1, minHeight: 0 }}>
                {groups.map((g) => (
                    <Box key={g.title} sx={{ flex: { md: 1 }, minHeight: 0, display: "flex", flexDirection: "column" }}>
                        <Typography
                            variant={compact ? "body2" : "subtitle1"}
                            component="h2"
                            sx={{ mb: compact ? 0.5 : 1.5, fontWeight: 600, lineHeight: 1.3 }}
                        >
                            {g.title}
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gap: compact ? 1 : 1.5,
                                gridTemplateColumns: { xs: "repeat(2, 1fr)", md: `repeat(${g.items.length}, 1fr)` },
                                gridAutoRows: { md: "1fr" },
                                flex: { md: 1 },
                                minHeight: 0,
                            }}
                        >
                            {g.items.map((item) => (
                                <CounterCard key={item.label} item={item} compact={compact} />
                            ))}
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Card>
    );
}