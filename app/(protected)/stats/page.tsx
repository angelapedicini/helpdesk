// app/(protected)/stats/page.tsx
"use client";

import { useState } from "react";
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useQuery } from "@apollo/client/react";
import EnhancedTable from "@/components/table";
import {
    TICKET_STATS_BY_DEPARTMENT_QUERY,
    TECHNICIAN_WORKLOADS_QUERY,
} from "@/apollo-client/queries/stats/stats.queries";
import {
    departmentStatsHeadCells,
    TicketDepartmentStatRow,
} from "./_components/department-stats-columns";
import {
    technicianWorkloadHeadCells,
    TechnicianWorkloadStatRow,
} from "./_components/technician-workload-columns";

type ViewMode = "table" | "chart";

function ViewToggle({
    value,
    onChange,
}: {
    value: ViewMode;
    onChange: (v: ViewMode) => void;
}) {
    return (
        <ToggleButtonGroup
            size="small"
            exclusive
            value={value}
            onChange={(_, v: ViewMode | null) => v && onChange(v)}
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
    const [deptView, setDeptView] = useState<ViewMode>("table");
    const [techView, setTechView] = useState<ViewMode>("table");

    const {
        data: byDeptData,
        loading: byDeptLoading,
        error: byDeptError,
    } = useQuery(TICKET_STATS_BY_DEPARTMENT_QUERY);

    const {
        data: techData,
        loading: techLoading,
        error: techError,
    } = useQuery(TECHNICIAN_WORKLOADS_QUERY);

    const byDepartment = byDeptData?.ticketStatsByDepartment ?? [];
    const byTechnician = techData?.technicianWorkloads ?? [];

    // Righe con `id` sintetico richiesto da EnhancedTable (RowBase)
    const byDepartmentRows: TicketDepartmentStatRow[] = byDepartment.map((d) => ({
        ...d,
        id: d.department,
    }));

    const technicianRows: TechnicianWorkloadStatRow[] = byTechnician.map((t) => ({
        ...t,
        id: t.technicianId,
    }));

    const grandTotal = byDepartment.reduce((sum, d) => sum + d.totalTickets, 0);

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "end",
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

                    <Typography
                        variant="h6"
                    >
                        {grandTotal}
                    </Typography>
                </Box>
            </Box>




            {/* --- Per dipartimento --- */}
            <Stack
                direction="row"
                sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
            >
                <Typography variant="h6">Per dipartimento</Typography>
                <ViewToggle value={deptView} onChange={setDeptView} />
            </Stack>

            {byDeptLoading && <p>Caricamento...</p>}
            {byDeptError && <p>Errore: {byDeptError.message}</p>}

            {!byDeptLoading && !byDeptError && (
                <>

                    {deptView === "table" ? (
                        byDepartmentRows.length === 0 ? (
                            <p>Nessun dato per dipartimento.</p>
                        ) : (
                            <Box sx={{ maxHeight: 400, mb: 5 }}>
                                <EnhancedTable
                                    rows={byDepartmentRows}
                                    headCells={departmentStatsHeadCells}
                                    order="asc"
                                    orderBy="department"
                                    onRequestSort={() => { }}
                                />
                            </Box>
                        )
                    ) : (
                        <Box
                            sx={{ mb: 5, p: 4, border: "1px dashed", borderColor: "divider" }}
                        >
                            <Typography color="text.secondary">Grafico in arrivo</Typography>
                        </Box>
                    )}
                </>
            )}

            {/* --- Per tecnico --- */}
            <Stack
                direction="row"
                sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
            >
                <Typography variant="h6">Per tecnico</Typography>
                <ViewToggle value={techView} onChange={setTechView} />
            </Stack>

            {techLoading && <p>Caricamento...</p>}
            {techError && <p>Errore: {techError.message}</p>}

            {!techLoading &&
                !techError &&
                (techView === "table" ? (
                    technicianRows.length === 0 ? (
                        <p>Nessun tecnico con ticket assegnati.</p>
                    ) : (
                        <Box sx={{ maxHeight: 400 }}>
                            <EnhancedTable
                                rows={technicianRows}
                                headCells={technicianWorkloadHeadCells}
                                order="asc"
                                orderBy="department"
                                onRequestSort={() => { }}
                            />
                        </Box>
                    )
                ) : (
                    <Box sx={{ p: 4, border: "1px dashed", borderColor: "divider" }}>
                        <Typography color="text.secondary">Grafico in arrivo</Typography>
                    </Box>
                ))}
        </Box>
    );
}