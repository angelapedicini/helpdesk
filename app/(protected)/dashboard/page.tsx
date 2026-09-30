"use client";

// app/(protected)/dashboard/page.tsx
// Contatori e liste arrivano da GET_DASHBOARD (il resolver decide in base a CASL).
// Le notifiche arrivano da useTicketNotifications, che usa la stessa query
// della navbar: Apollo la legge dalla cache, senza una seconda richiesta di rete.

import Link from "next/link";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useQuery } from "@apollo/client/react";
import type { DashboardList, TicketScope } from "@/graphql-generated/schema";
import Counters, { type CounterGroup } from "@/components/counters/counters";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";
import { fmt } from "@/lib/helper/formt-helpers";
import TicketList, { TicketItem } from "./_components/ticketList";
import { GET_DASHBOARD } from "@/apollo-client/queries/dashboard/dashboard.queries";
import { useAbility } from "@/lib/casl/abilityContext";
import { TICKET_SCOPE_CONFIG } from "@/components/enums/ticket-scope.config";
import { TICKET_ALERTS, type AlertFilterKey } from "@/components/enums/ticket-alert.config";
import { useTicketNotifications } from "./_components/hooks/useTicketNotifications";
import TicketNotificationsList from "./_components/notification";

const PAGE_HEIGHT = "90vh";
const SIDEBAR_WIDTH = 320;

// La copy della dashboard sta qui. Il backend dice solo QUALI gruppi e QUALI
// liste esistono, mai con quali titoli: i testi restano nel frontend.
const TICKET_LIST_LABEL: Record<DashboardList, string> = {
    RECENT_CREATED: "Ultimi ticket creati",
    RECENT_ASSIGNED: "Ultimi assegnati a me",
    UPCOMING_DEADLINES: "Prossime scadenze",
    RECENT_DEPARTMENT: "Ultimi ticket del reparto",
    RECENT_ALL: "Ultimi ticket",
};

// Stessa forma dei link in components/nav-links.tsx: scope in minuscolo,
// la pagina tickets lo riporta maiuscolo con toUpperCase().
function counterHref(scope: TicketScope, filter: AlertFilterKey): string {
    return `/tickets?scope=${scope.toLowerCase()}&filter=${filter}`;
}

export default function DashboardPage() {
    const ability = useAbility();
    const { data } = useQuery(GET_DASHBOARD);
    const { unread, notifications, openUnread, openNotification } = useTicketNotifications();

    const canReadStats = ability.can("read", "TicketStats");
    const dashboard = data?.dashboard;

    const counterGroups: CounterGroup[] =
        dashboard?.counterGroups.map((group) => ({
            title: TICKET_SCOPE_CONFIG[group.scope].label,
            alerts: TICKET_ALERTS.map((def) => ({
                def,
                value: group.alerts[def.key],
            })),
            href: (def) => counterHref(group.scope, def.filterKey),
        })) ?? [];

    const lists: { title: string; tickets: TicketItem[] }[] =
        dashboard?.ticketLists.map((list) => ({
            title: TICKET_LIST_LABEL[list.list],
            tickets: list.tickets.map((t) => ({
                id: t.id,
                title: t.title,
                date: fmt(t.createdAt),
                status: TICKET_STATUS_CONFIG[t.status].label,
            })),
        })) ?? [];

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
                        <Button variant="contained" size="large" startIcon={<AddIcon />} component={Link} href="/categories">
                            Apri ticket
                        </Button>
                        {canReadStats && (
                            <Button variant="outlined" size="large" startIcon={<BarChartIcon />} component={Link} href="/stats">
                                Statistiche
                            </Button>
                        )}
                    </Stack>
                </Stack>

                <Counters
                    groups={counterGroups}
                    size={counterGroups.length > 1 ? "compact" : "regular"}
                />

                <Box
                    sx={{
                        flex: { md: 1 },
                        minHeight: 0,
                        overflowY: { md: "auto" },
                        display: "grid",
                        gap: 3,
                        gridTemplateColumns: {
                            xs: "minmax(0, 1fr)",
                            // Una colonna per lista, invece del fisso a 2: il
                            // technician ne riceve 3 (MINE, poi le due di
                            // ASSIGNED_TO_ME) e la terza andava a capo.
                            // Math.max perché lists è vuota durante il loading.
                            md: `repeat(${Math.max(lists.length, 1)}, minmax(0, 1fr))`,
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