// app/(protected)/tickets/_components/ticket-alerts.tsx
"use client";

import { Box, Button, Stack } from "@mui/material";
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
            sx={{ alignItems: "end", mb: 2 }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Counters groups={groups} size="compact" layout="row" />
            </Box>

            {/* Sempre visibile: quando non c'è nulla da spegnere resta grigio.
                Sparire e ricomparire a ogni filtro sposta il bottone sotto gli
                occhi mentre lo stai usando. */}
            <Button size="small" onClick={onReset} disabled={activeCount === 0} sx={{ flexShrink: 0 }}>
                Reset filtri
            </Button>
        </Stack>
    );
}
