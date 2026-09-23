"use client";

import type { ReactElement } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReplayIcon from "@mui/icons-material/Replay";

import type { FilterTicketOutput } from "@/lib/validators/ticket-detail.schema";

type TicketAlertCounts = {
    firstResponseOverdue: number;
    dueDateOverdue: number;
    reopened: number;
    firstResponseDueSoon: number;
    dueDateDueSoon: number;
};

type TicketAlertsProps = {
    alerts?: TicketAlertCounts | null;
    loading?: boolean;
    filter?: FilterTicketOutput;
    onApply: (filter: FilterTicketOutput) => void;
    onReset: () => void;
};

type AlertItem = {
    key: keyof TicketAlertCounts;
    filterKey: keyof FilterTicketOutput;
    label: string;
    icon: ReactElement;
    color: "error" | "warning" | "secondary";
};

const ALERT_ITEMS: AlertItem[] = [
    {
        key: "firstResponseOverdue",
        filterKey: "firstResponseOverdue",
        label: "Prima risposta scaduta",
        icon: <ErrorOutlinedIcon fontSize="small" />,
        color: "error",
    },
    {
        key: "dueDateOverdue",
        filterKey: "overdue",
        label: "Due date scaduta",
        icon: <ErrorOutlinedIcon fontSize="small" />,
        color: "error",
    },
    {
        key: "reopened",
        filterKey: "reopened",
        label: "Riaperti",
        icon: <ReplayIcon fontSize="small" />,
        color: "secondary",
    },
    {
        key: "firstResponseDueSoon",
        filterKey: "firstResponseDueSoon",
        label: "Prima risposta in scadenza",
        icon: <AccessTimeIcon fontSize="small" />,
        color: "warning",
    },
    {
        key: "dueDateDueSoon",
        filterKey: "dueDateDueSoon",
        label: "Due date in scadenza",
        icon: <AccessTimeIcon fontSize="small" />,
        color: "warning",
    },
];

// Ogni chip applica il filtro della lista corrispondente al conteggio:
// lo stesso filtro che si accende nella sidebar, visto che entrambi
// condividono lo stato (useFilterState).
function filterForItem(item: AlertItem): FilterTicketOutput {
    switch (item.filterKey) {
        case "firstResponseOverdue":
            return { firstResponseOverdue: true };
        case "overdue":
            return { overdue: true };
        case "reopened":
            return { reopened: true };
        case "firstResponseDueSoon":
            return { firstResponseDueSoon: true };
        case "dueDateDueSoon":
            return { dueDateDueSoon: true };
        default:
            return {};
    }
}

export default function TicketAlerts({
    alerts,
    loading,
    filter,
    onApply,
    onReset,
}: TicketAlertsProps) {
    const activeCount = filter
        ? Object.values(filter).filter((v) => v !== undefined).length
        : 0;

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: "center",
                flexWrap: "wrap",
                mb: 2,
            }}
        >
            {ALERT_ITEMS.map((item) => {
                const count = alerts?.[item.key] ?? 0;
                const active = filter?.[item.filterKey] === true;

                return (
                    <Chip
                        key={item.key}
                        variant={active ? "filled" : "outlined"}
                        color={item.color}
                        icon={item.icon}
                        disabled={loading}
                        onClick={() =>
                            active
                                ? onApply({})
                                : onApply(filterForItem(item))
                        }
                        label={
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    gap: 0.5,
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 700 }}
                                >
                                    {count}
                                </Typography>
                                <Typography variant="caption">
                                    {item.label}
                                </Typography>
                            </Box>
                        }
                    />
                );
            })}

            {activeCount > 0 && (
                <Chip
                    label="Reset filtri"
                    size="small"
                    variant="outlined"
                    onClick={onReset}
                />
            )}
        </Stack>
    );
}