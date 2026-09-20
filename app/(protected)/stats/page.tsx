"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useQuery } from "@apollo/client/react";

import EnhancedTable from "@/components/table";
import DynamicChart from "@/components/dynamic-charts";
import { useStatsPermissions } from "@/lib/casl/abilities/stats/hook-permission";

import StatsViewsList from "./_components/stats-views-list";
import { STATS_VIEWS } from "./_components/views";

type DisplayMode = "table" | "chart";

export default function TicketStatsPage() {
    const [activeViewId, setActiveViewId] = useState(
        STATS_VIEWS[0].id,
    );
    const [mode, setMode] = useState<DisplayMode>("table");

    const activeView = STATS_VIEWS.find(
        (view) => view.id === activeViewId,
    ) ?? STATS_VIEWS[0];

    const { canViewAllDepartments } = useStatsPermissions();
    const viewLabels = activeView.viewLabels[
        canViewAllDepartments ? "all" : "ownDepartment"
    ];

    const { data, loading, error } = useQuery(activeView.query);

    const source = activeView.select(data);
    const rows = activeView.buildRows(source);
    const total = activeView.total(source);

    return (
        <Box
            sx={{
                mt: 3,
                mx: 2,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                alignItems: "flex-start",
            }}
        >
            {/* Selezione vista */}
            <Box
                sx={{
                    width: { xs: "100%", md: 220 },
                    flexShrink: 0,
                }}
            >
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Statistiche
                </Typography>

                <StatsViewsList
                    views={STATS_VIEWS}
                    activeId={activeView.id}
                    onSelect={setActiveViewId}
                />
            </Box>

            {/* Contenuto vista attiva */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Header: totale ticket + toggle tabella/grafico */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    sx={{
                        alignItems: { xs: "flex-start", md: "center" },
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 2,
                            py: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            boxShadow: 1,
                            backgroundColor: "background.paper",
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Totale ticket
                        </Typography>

                        <Typography variant="h6">
                            {total}
                        </Typography>
                    </Box>

                    <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={mode}
                        onChange={(
                            _event,
                            nextMode: DisplayMode | null,
                        ) => {
                            if (nextMode) setMode(nextMode);
                        }}
                    >
                        <ToggleButton value="table">
                            Tabella
                        </ToggleButton>
                        <ToggleButton value="chart">
                            Grafico
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>

                {/* Loading */}
                {loading && (
                    <Typography color="text.secondary">
                        Caricamento...
                    </Typography>
                )}

                {/* Error */}
                {error && (
                    <Typography color="error">
                        Errore: {error.message}
                    </Typography>
                )}

                {/* Contenuto: tabella o grafico */}
                {!loading && !error && (
                    rows.length === 0 ? (
                        <Box
                            sx={{
                                p: 4,
                                border: "1px dashed",
                                borderColor: "divider",
                            }}
                        >
                            <Typography color="text.secondary">
                                Nessun dato disponibile.
                            </Typography>
                        </Box>
                    ) : mode === "table" ? (
                        <EnhancedTable
                            rows={rows}
                            headCells={activeView.headCells}
                        />
                    ) : (
                        <Box sx={{ width: "100%" }}>
                            <DynamicChart
                                data={source}
                                schema={activeView.schema}
                                viewLabels={viewLabels}
                                height={activeView.chartHeight}
                            />
                        </Box>
                    )
                )}
            </Box>
        </Box>
    );
}