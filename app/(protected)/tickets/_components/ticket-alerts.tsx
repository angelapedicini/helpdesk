// app/(protected)/tickets/_components/ticket-alerts.tsx
"use client";

import { Box, Button, Stack } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import type { TicketAlerts } from "@/graphql-generated/schema";
import { TICKET_ALERTS } from "@/components/enums/ticket-alert.config";
import Counters, { type CounterGroup } from "@/components/counters/counters";
import type { FilterTicketOutput } from "@/lib/validators/ticket-detail.schema";

/**
 * Le stesse card dei contatori della dashboard, con lo stesso identico aspetto.
 *
 * Cambia solo il comportamento: qui la card non porta a un'altra pagina,
 * accende e spegne il filtro sulla lista che si ha sotto. Sia la label sia il
 * colore arrivano da components/enums/ticket-alert.config, quindi le due pagine
 * non possono divergere.
 *
 * Su desktop sono in riga (barra filtri sopra la tabella). Su mobile diventano
 * una lista a tutta larghezza, una card per riga (layout "column").
 */
export default function TicketAlerts({
    alerts,
    loading,
    filter,
    onApply,
    onReset,
}: {
    alerts?: TicketAlerts | null;
    loading?: boolean;
    filter?: FilterTicketOutput;
    onApply: (filter: FilterTicketOutput) => void;
    onReset: () => void;
}) {
    // Stesso breakpoint della pagina ticket (tabella -> card).
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

    const activeCount = filter
        ? Object.values(filter).filter((v) => v !== undefined).length
        : 0;

    const activeFilterKey =
        TICKET_ALERTS.find(
            (def) => filter?.[def.filterKey] === true
        )?.filterKey ?? null;

    const groups: CounterGroup[] = [
        {
            alerts: TICKET_ALERTS.map((def) => ({
                def,
                value: alerts?.[def.key] ?? 0,
            })),
            onToggle: (def) =>
                onApply(
                    activeFilterKey === def.filterKey
                        ? {}
                        : ({ [def.filterKey]: true } as FilterTicketOutput)
                ),
            activeFilterKey,
            disabled: loading,
        },
    ];

    return (
        <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            sx={{
                // Su mobile "stretch" fa occupare tutta la larghezza; con "end"
                // il blocco dei contatori si restringeva al suo contenuto.
                alignItems: { xs: "stretch", md: "end" },
                mb: 2,
            }}
        >
            <Box sx={{ flex: { md: 1 }, minWidth: 0 }}>
                <Counters
                    groups={groups}
                    size="compact"
                    layout={isMobile ? "column" : "row"}
                />
            </Box>

            {/* Sempre visibile: quando non c'è nulla da spegnere resta grigio.
                Sparire e ricomparire a ogni filtro sposta il bottone sotto gli
                occhi mentre lo stai usando. */}
            <Button
                size="small"
                onClick={onReset}
                disabled={activeCount === 0}
                sx={{ flexShrink: 0, alignSelf: { xs: "flex-end", md: "auto" } }}
            >
                Reset filtri
            </Button>
        </Stack>
    );
}