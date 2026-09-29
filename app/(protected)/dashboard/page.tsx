"use client";

// app/(protected)/dashboard/page.tsx
// Dati mock qui sotto: sostituirli con dashboardSummary.
// Il selettore ruolo serve solo per simulare CASL.

import { useState } from "react";
import Link from "next/link";
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import Counters, { CounterGroup } from "./_components/counters";
import TicketList, { TicketItem } from "./_components/ticketList";
import Notifications, { NotificationItem } from "./_components/notification";


type Role = "EMPLOYEE" | "TEC" | "ADMIN" | "SYSTEM_ADMIN";

const PAGE_HEIGHT = "90vh";
const SIDEBAR_WIDTH = 320;

// ---------------------------------------------------------------------------
// Dati mock
// ---------------------------------------------------------------------------

const ALERTS = [
    { label: "Prima risposta in ritardo", tone: "error", href: "/tickets?filter=firstResponseOverdue" },
    { label: "Scadenza superata", tone: "error", href: "/tickets?filter=overdue" },
    { label: "Riaperti", tone: "warning", href: "/tickets?filter=reopened" },
    { label: "Prima risposta in scadenza", tone: "warning", href: "/tickets?filter=firstResponseDueSoon" },
    { label: "Scadenza in arrivo", tone: "info", href: "/tickets?filter=dueDateDueSoon" },
] as const;

// i 5 numeri seguono l'ordine di ALERTS
const counters = (title: string, values: number[]): CounterGroup => ({
    title,
    items: ALERTS.map((a, i) => ({ ...a, value: values[i] })),
});

const COUNTERS = {
    mine: counters("I miei ticket", [0, 1, 2, 0, 3]),
    assigned: counters("Assegnati a me", [2, 4, 1, 3, 6]),
    department: counters("Il mio reparto", [5, 9, 3, 7, 12]),
    all: counters("Tutti i ticket", [11, 24, 8, 15, 31]),
};

// Sostituire con CASL: quali gruppi di contatori vede ogni ruolo
const COUNTERS_BY_ROLE: Record<Role, CounterGroup[]> = {
    EMPLOYEE: [COUNTERS.mine],
    TEC: [COUNTERS.mine, COUNTERS.assigned],
    ADMIN: [COUNTERS.mine, COUNTERS.department],
    SYSTEM_ADMIN: [COUNTERS.mine, COUNTERS.all],
};

const TICKETS: TicketItem[] = [
    { id: 412, title: "Stampante del secondo piano non risponde", status: "Aperto", date: "Oggi, 09:12" },
    { id: 409, title: "Richiesta accesso cartella condivisa", status: "In lavorazione", date: "Ieri, 16:40" },
    { id: 405, title: "Errore in fase di login sul gestionale", status: "Riaperto", date: "27 set" },
    { id: 398, title: "Sostituzione monitor postazione 14", status: "In lavorazione", date: "25 set" },
    { id: 391, title: "Configurazione casella email condivisa", status: "Chiuso", date: "22 set" },
];

const LISTS_BY_ROLE: Record<Role, { title: string; tickets: TicketItem[] }[]> = {
    EMPLOYEE: [{ title: "Ultimi ticket creati", tickets: TICKETS.slice(0, 3) }],
    TEC: [
        { title: "Ultimi assegnati a me", tickets: TICKETS.slice(0, 3) },
        { title: "Prossime scadenze", tickets: TICKETS.slice(2, 5) },
    ],
    ADMIN: [{ title: "Ultimi ticket del reparto", tickets: TICKETS.slice(0, 3) }],
    SYSTEM_ADMIN: [{ title: "Ultimi ticket", tickets: TICKETS.slice(0, 3) }],
};

const NOTIFICATIONS: NotificationItem[] = [
    { name: "Marco Rossi", action: "ha risposto al ticket #412", time: "10 min fa", unread: true },
    { name: "Sistema", action: "ha riaperto il ticket #405", time: "2 ore fa", unread: true },
    { name: "Laura Bianchi", action: "ti ha assegnato il ticket #409", time: "Ieri" },
    { name: "Sistema", action: "ha chiuso il ticket #391", time: "22 set" },
];

const ROLE_LABEL: Record<Role, string> = {
    EMPLOYEE: "Employee",
    TEC: "Tec",
    ADMIN: "Admin",
    SYSTEM_ADMIN: "System admin",
};

// ---------------------------------------------------------------------------
// Pagina
// ---------------------------------------------------------------------------

export default function DashboardPage() {
    const [role, setRole] = useState<Role>("EMPLOYEE");
    const isAdmin = role === "ADMIN" || role === "SYSTEM_ADMIN";
    const lists = LISTS_BY_ROLE[role];

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
            {/* Notifiche: solo da md, su mobile si aprono dalla navbar */}
            <Box sx={{ display: { xs: "none", md: "flex" }, minHeight: 0 }}>
                <Notifications notifications={NOTIFICATIONS} onMarkAllRead={() => {}} />
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

                    {/* Anteprima ruolo: solo per il modello (simula CASL) */}
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={role}
                        onChange={(_, v: Role | null) => v && setRole(v)}
                        sx={{ alignSelf: "flex-start", flexWrap: "wrap" }}
                        aria-label="Anteprima ruolo"
                    >
                        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                            <ToggleButton key={r} value={r}>
                                {ROLE_LABEL[r]}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button variant="contained" size="large" startIcon={<AddIcon />} component={Link} href="/userCategory">
                            Apri ticket
                        </Button>
                        {isAdmin && (
                            <Button variant="outlined" size="large" startIcon={<BarChartIcon />} component={Link} href="/stats">
                                Statistiche
                            </Button>
                        )}
                    </Stack>
                </Stack>

                <Counters groups={COUNTERS_BY_ROLE[role]} />

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