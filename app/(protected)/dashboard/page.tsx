"use client";

// app/(protected)/dashboard/page.tsx
// Contatori e liste arrivano da GET_DASHBOARD (il resolver decide in base a CASL).
// Le notifiche arrivano da useTicketNotifications, che usa la stessa query
// della navbar: Apollo la legge dalla cache, senza una seconda richiesta di rete.

import Link from "next/link";
import { Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useQuery } from "@apollo/client/react";
import Counters, { CounterGroup } from "./_components/counters";
import TicketList, { TicketItem } from "./_components/ticketList";
import { GET_DASHBOARD } from "@/apollo-client/queries/dashboard/dashboard.queries";
import { useAbility } from "@/lib/casl/abilityContext";
import { TICKET_SCOPE_CONFIG } from "@/components/enums/ticket-scope.config";
import {
    ALERT_DESCRIPTORS,
    TICKET_LIST_LABEL,
    TICKET_STATUS_LABEL,
    counterHref,
    formatDate,
} from "./dashboard-labels";
import { useTicketNotifications } from "./_components/hooks/useTicketNotifications";
import TicketNotificationsList from "./_components/notification";

const PAGE_HEIGHT = "90vh";
const SIDEBAR_WIDTH = 320;

export default function DashboardPage() {
    const ability = useAbility();
    const { data, loading } = useQuery(GET_DASHBOARD);
    const { unread, notifications, openUnread, openNotification } = useTicketNotifications();

    const canReadStats = ability.can("read", "TicketStats");
    const dashboard = data?.dashboard;

    const counterGroups: CounterGroup[] =
        dashboard?.counterGroups.map((group) => ({
            title: TICKET_SCOPE_CONFIG[group.scope].label,
            items: ALERT_DESCRIPTORS.map((d) => ({
                value: group.alerts[d.key],
                label: d.label,
                tone: d.tone,
                href: counterHref(group.scope, d.filter),
            })),
        })) ?? [];

    const lists: { title: string; tickets: TicketItem[] }[] =
        dashboard?.ticketLists.map((list) => ({
            title: TICKET_LIST_LABEL[list.list],
            tickets: list.tickets.map((t) => ({
                id: t.id,
                title: t.title,
                date: formatDate(t.createdAt),
                status: TICKET_STATUS_LABEL[t.status],
            })),
        })) ?? [];

    if (loading && !dashboard) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "grid",
                gap: 3,
                p: { xs: 2, md: 3 },
                boxSizing: "border-box",
                gridTemplateColumns: { xs: "1fr", md: `${SIDEBAR_WIDTH}px minmax(0, 1fr)` },
                height: { md: PAGE_HEIGHT },
                overflow: { md: "hidden" },
            }}
        >
            {/* Notifiche: solo da md, su mobile si aprono dalla campanella in navbar */}
            <Box sx={{ display: { xs: "none", md: "flex" }, minHeight: 0 }}>
                <Paper sx={{ width: "100%", overflowY: "auto" }}>
                    <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                        Notifiche
                    </Typography>
                    <TicketNotificationsList
                        unread={unread}
                        notifications={notifications}
                        onOpenUnread={openUnread}
                        onOpenNotification={openNotification}
                    />
                </Paper>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, minHeight: 0 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", flexShrink: 0 }}
                >
                    <Typography variant="h5" component="h1">
                        Dashboard
                    </Typography>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button variant="contained" size="large" startIcon={<AddIcon />} component={Link} href="/userCategory">
                            Apri ticket
                        </Button>
                        {canReadStats && (
                            <Button variant="outlined" size="large" startIcon={<BarChartIcon />} component={Link} href="/stats">
                                Statistiche
                            </Button>
                        )}
                    </Stack>
                </Stack>

                <Counters groups={counterGroups} />

                <Box
                    sx={{
                        flex: { md: 1 },
                        minHeight: 0,
                        overflowY: { md: "auto" },
                        display: "grid",
                        gap: 3,
                        gridTemplateColumns: {
                            xs: "minmax(0, 1fr)",
                            md: lists.length > 1 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
                        },
                        alignContent: "start",
                        alignItems: "start",
                    }}
                >
                    {lists.map((l) => (
                        <TicketList key={l.title} title={l.title} tickets={l.tickets} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}