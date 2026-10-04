"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type {
    GridColDef,
    GridRenderCellParams,
    GridRowId,
    GridValidRowModel,
} from "@mui/x-data-grid";

type CardListRow = GridValidRowModel & { id: GridRowId };

interface CardListProps<T extends CardListRow> {
    rows: T[];
    /** Le stesse colonne passate al DataGrid. */
    columns: GridColDef<T>[];

    /** field mostrato come titolo della card. */
    titleKey?: string;
    /** field mostrato sopra il titolo (es. id). */
    subtitleKey?: string;
    /** field da non mostrare nel body della card. */
    hiddenKeys?: string[];
    /** field della colonna azioni: il suo renderCell finisce in CardActions. */
    actionsField?: string;

    hasNextPage?: boolean;
    onLoadMore?: () => void;

    getRowClassName?: (row: T) => string | undefined;
    getRowTooltip?: (row: T) => string | undefined;
}

// Fuori dal grid non c'è un apiRef: i getter/formatter delle colonne non lo
// usano, quindi passo un valore finto.
const NO_API = undefined as never;

function buildParams<T extends CardListRow>(
    col: GridColDef<T>,
    row: T
): GridRenderCellParams<T> {
    const raw = (row as Record<string, unknown>)[col.field];
    const value = col.valueGetter
        ? col.valueGetter(raw as never, row, col, NO_API)
        : raw;
    const formattedValue = col.valueFormatter
        ? col.valueFormatter(value as never, row, col, NO_API)
        : value;

    return {
        id: row.id,
        field: col.field,
        row,
        value,
        formattedValue,
        colDef: col,
        api: NO_API,
        cellMode: "view",
        hasFocus: false,
        isEditable: false,
        tabIndex: -1,
    } as unknown as GridRenderCellParams<T>;
}

function renderValue<T extends CardListRow>(
    col: GridColDef<T>,
    row: T
): React.ReactNode {
    const params = buildParams(col, row);

    if (col.renderCell) return col.renderCell(params);

    const shown = params.formattedValue ?? params.value;
    return shown == null || shown === "" ? "-" : String(shown);
}

function getCellClass<T extends CardListRow>(
    col: GridColDef<T>,
    row: T
): string | undefined {
    const { cellClassName } = col;
    if (!cellClassName) return undefined;
    if (typeof cellClassName === "string") return cellClassName;
    return cellClassName(buildParams(col, row) as never) || undefined;
}

export default function CardList<T extends CardListRow>({
    rows,
    columns,
    titleKey,
    subtitleKey,
    hiddenKeys = [],
    actionsField = "actions",
    hasNextPage = false,
    onLoadMore,
    getRowClassName,
    getRowTooltip,
}: CardListProps<T>) {
    const labelOf = (c: GridColDef<T>) => c.headerName ?? c.field;

    const titleCol = columns.find((c) => c.field === titleKey);
    const subtitleCol = columns.find((c) => c.field === subtitleKey);
    const actionsCol = columns.find((c) => c.field === actionsField);
    const bodyCols = columns.filter(
        (c) =>
            c.field !== titleKey &&
            c.field !== subtitleKey &&
            c.field !== actionsField &&
            !hiddenKeys.includes(c.field)
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
                            {subtitleCol && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    className={getCellClass(subtitleCol, row)}
                                >
                                    {labelOf(subtitleCol)}: {renderValue(subtitleCol, row)}
                                </Typography>
                            )}

                            {titleCol && (
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    className={getCellClass(titleCol, row)}
                                    sx={{ fontWeight: 600, wordBreak: "break-word" }}
                                >
                                    {renderValue(titleCol, row)}
                                    <Divider />
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
                                {bodyCols.map((col, index) => (
                                    <React.Fragment key={col.field}>
                                        <Typography variant="body2" color="text.secondary">
                                            {labelOf(col)}
                                        </Typography>
                                        <Box
                                            className={getCellClass(col, row)}
                                            sx={{ minWidth: 0, wordBreak: "break-word" }}
                                        >
                                            {renderValue(col, row)}
                                        </Box>

                                        {/* Riga sotto la coppia, a tutta larghezza. Non dopo l'ultima. */}
                                        {index < bodyCols.length - 1 && (
                                            <Divider sx={{ gridColumn: "1 / -1" }} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </Box>
                        </CardContent>

                        {actionsCol && (
                            <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                                {renderValue(actionsCol, row)}
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