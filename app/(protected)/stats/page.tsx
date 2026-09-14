"use client";

import { useState } from "react";
import {
    Box,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useQuery } from "@apollo/client/react";

import EnhancedTable from "@/components/table";
import DynamicChart from "@/components/dynamic-charts";

import {
    TICKET_STATS_BY_DEPARTMENT_QUERY,
} from "@/apollo-client/queries/stats/stats.queries";

import { NewSchema } from "@/lib/validators/stat.schema";

import {
    departmentStatsHeadCells,
    DepartmentStatsRow,
} from "./_components/department-stats-columns";
import { ME_QUERY } from "@/apollo-client/queries/user/me";

type ViewMode = "table" | "chart";

function ViewToggle({
    value,
    onChange,
}: {
    value: ViewMode;
    onChange: (value: ViewMode) => void;
}) {
    return (
        <ToggleButtonGroup
            size="small"
            exclusive
            value={value}
            onChange={(_, value: ViewMode | null) => {
                if (value) {
                    onChange(value);
                }
            }}
        >
            <ToggleButton value="table" aria-label="Tabella">
                <TableChartIcon fontSize="small" />
            </ToggleButton>

            <ToggleButton value="chart" aria-label="Grafico">
                <BarChartIcon fontSize="small" />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}

export default function TicketStatsPage() {
    const [view, setView] = useState<ViewMode>("table");
    const { data: meData } = useQuery(ME_QUERY);
    const isAdmin = meData?.me?.role === "ADMIN";

    const viewLabels: Record<string, string> = isAdmin
        ? { stati: "Stati per dipartimento" }
        : {
            totali: "Totali per dipartimento",
            media: "Media per dipartimento",
            stati: "Stati per dipartimento",
        };

    const {
        data,
        loading,
        error,
    } = useQuery(TICKET_STATS_BY_DEPARTMENT_QUERY);

    const stats = data?.ticketStatsByDepartment ?? [];

    const rows: DepartmentStatsRow[] = stats.map((item) => ({
        ...item,
        id: item.department,
    }));

    const grandTotal = stats.reduce(
        (sum, department) => sum + department.total,
        0,
    );

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            {/* Header */}
            <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{
                    alignItems: { xs: "flex-start", md: "flex-end" },
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 3,
                }}
            >
                <Typography variant="h5">
                    Statistiche ticket
                </Typography>

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
                        {grandTotal}
                    </Typography>
                </Box>
            </Stack>

            {/* Titolo + pulsante */}
            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                }}
            >
                <Typography variant="h6">
                    Statistiche per dipartimento
                </Typography>

                <ViewToggle
                    value={view}
                    onChange={setView}
                />
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

            {/* Contenuto */}
            {!loading && !error && (
                stats.length === 0 ? (
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
                ) : view === "table" ? (
                    <Box sx={{ maxHeight: 500 }}>
                        <EnhancedTable
                            rows={rows}
                            headCells={departmentStatsHeadCells}
                            order="asc"
                            orderBy="department"
                            onRequestSort={() => { }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ width: "100%" }}>
                        <DynamicChart
                            data={stats}
                            schema={NewSchema}
                            viewLabels={viewLabels}
                        />

                    </Box>
                )
            )}
        </Box>
    );
}
