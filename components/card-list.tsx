"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import type { HeadCell, RowBase } from "@/components/table";

interface CardListProps<T extends RowBase> {
    rows: T[];
    headCells: readonly HeadCell<T>[];

    /** Colonna mostrata come titolo della card. */
    titleKey?: keyof T;
    /** Colonna mostrata sopra il titolo (es. ID). */
    subtitleKey?: keyof T;
    /** Colonne da non mostrare nel body della card. */
    hiddenKeys?: (keyof T)[];

    actions?: (row: T) => React.ReactNode;

    hasNextPage?: boolean;
    onLoadMore?: () => void;

    getRowClassName?: (row: T) => string | undefined;
    getCellClassName?: (row: T, headCellId: keyof T) => string | undefined;
    getRowTooltip?: (row: T) => string | undefined;
}

function renderValue<T>(cell: HeadCell<T>, row: T): React.ReactNode {
    return cell.render ? cell.render(row) : String(row[cell.id]);
}

export default function CardList<T extends RowBase>({
    rows,
    headCells,
    titleKey,
    subtitleKey,
    hiddenKeys = [],
    actions,
    hasNextPage = false,
    onLoadMore,
    getRowClassName,
    getCellClassName,
    getRowTooltip,
}: CardListProps<T>) {
    const titleCell = headCells.find((h) => h.id === titleKey);
    const subtitleCell = headCells.find((h) => h.id === subtitleKey);
    const bodyCells = headCells.filter(
        (h) =>
            h.id !== titleKey &&
            h.id !== subtitleKey &&
            !hiddenKeys.includes(h.id)
    );

    // --- Infinite scroll: sentinella in fondo alla lista ---
    const sentinelRef = React.useRef<HTMLDivElement>(null);
    const loadingLockRef = React.useRef(false);

    React.useEffect(() => {
        loadingLockRef.current = false;
    }, [rows.length, hasNextPage]);

    React.useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !hasNextPage || !onLoadMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !loadingLockRef.current) {
                    loadingLockRef.current = true;
                    onLoadMore();
                }
            },
            { rootMargin: "200px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
        // rows.length: ricrea l'observer dopo ogni caricamento, così se la
        // sentinella è ancora visibile parte subito la pagina successiva
    }, [hasNextPage, onLoadMore, rows.length]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {rows.map((row) => {
                const tooltipTitle = getRowTooltip?.(row);

                const card = (
                    <Card variant="outlined" className={getRowClassName?.(row)}>
                        <CardContent sx={{ pb: 1 }}>
                            {subtitleCell && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    className={getCellClassName?.(row, subtitleCell.id)}
                                >
                                    {subtitleCell.label}: {renderValue(subtitleCell, row)}
                                </Typography>
                            )}

                            {titleCell && (
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    className={getCellClassName?.(row, titleCell.id)}
                                    sx={{ fontWeight: 600, wordBreak: "break-word" }}
                                >
                                    {renderValue(titleCell, row)}
                                </Typography>
                            )}

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "auto 1fr",
                                    columnGap: 2,
                                    rowGap: 0.75,
                                    alignItems: "center",
                                }}
                            >
                                {bodyCells.map((cell) => (
                                    <React.Fragment key={String(cell.id)}>
                                        <Typography variant="body2" color="text.secondary">
                                            {cell.label}
                                        </Typography>
                                        <Box
                                            className={getCellClassName?.(row, cell.id)}
                                            sx={{ minWidth: 0, wordBreak: "break-word" }}
                                        >
                                            {renderValue(cell, row)}
                                        </Box>
                                    </React.Fragment>
                                ))}
                            </Box>
                        </CardContent>

                        {actions && (
                            <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                                {actions(row)}
                            </CardActions>
                        )}
                    </Card>
                );

                return tooltipTitle ? (
                    <Tooltip key={row.id} title={tooltipTitle} arrow placement="top">
                        {card}
                    </Tooltip>
                ) : (
                    <React.Fragment key={row.id}>{card}</React.Fragment>
                );
            })}

            {hasNextPage && <div ref={sentinelRef} style={{ height: 1 }} />}
        </Box>
    );
}