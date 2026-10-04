"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
    DataGrid,
    type DataGridProps,
    type GridColDef,
    type GridRowId,
    type GridSortModel,
    type GridValidRowModel,
} from "@mui/x-data-grid";

// Misure del DataGrid (default di MUI, esplicitate per calcolare l'altezza:
// il grid ha bisogno di un'altezza definita dal genitore)
const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 52; // barra di paginazione
const GRID_EXTRA = 18; // bordo + eventuale scrollbar orizzontale
const GRID_MIN_HEIGHT = 160; // altezza minima di default quando non ci sono righe

type ServerDataGridProps<R extends GridValidRowModel & { id: GridRowId }> = {
    rows: R[];
    columns: GridColDef<R>[]; // passale stabili (useMemo) per evitare ricalcoli

    loading?: boolean;

    // paginazione a cursore
    hasNextPage?: boolean;
    onLoadMore?: () => void; // assente se i dati sono già tutti caricati
    totalCount?: number | null; // se assente il footer mostra "N+"
    pageSize?: number; // deve coincidere con il "first" della query

    // "server": dati paginati a cursore dal BE. L'ordine lo decide il BE e il
    //           filtro nativo del grid è spento (agirebbe solo sulle righe
    //           già scaricate); i filtri vanno nelle variabili della query.
    // "client": dati completi sul client. Ordinamento e filtro nativi attivi.
    sortingMode?: "server" | "client";

    // controllato dal genitore. Serve solo con sortingMode "server"; in
    // "client" si può omettere e il grid gestisce lo stato da solo.
    sortModel?: GridSortModel;
    onSortModelChange?: (model: GridSortModel) => void;

    // quando cambia (scope, filtri, ordinamento...) si torna alla pagina 1.
    // Passa un valore stabile, es. JSON.stringify([...]), non un oggetto nuovo.
    resetKey?: string;

    minHeight?: number; // altezza minima in px, default 160
    maxHeight?: string; // tetto massimo (qualsiasi valore CSS), default 70vh
    getRowClassName?: (row: R) => string | undefined;
    sx?: DataGridProps["sx"];
};

export default function ServerDataGrid<
    R extends GridValidRowModel & { id: GridRowId },
>({
    rows,
    columns,
    loading = false,
    hasNextPage = false,
    onLoadMore,
    totalCount = null,
    pageSize = 20,
    sortingMode = "server",
    sortModel,
    onSortModelChange,
    resetKey,
    minHeight = GRID_MIN_HEIGHT,
    maxHeight = "70vh",
    getRowClassName,
    sx,
}: ServerDataGridProps<R>) {
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize,
    });

    // Il grid pagina lato client le righe già caricate. Con i cursori, quando
    // l'utente arriva all'ultima pagina caricata scarico la successiva: così
    // il pulsante "pagina successiva" si abilita da solo.
    useEffect(() => {
        if (!hasNextPage || loading || !onLoadMore) return;
        if ((paginationModel.page + 1) * pageSize >= rows.length) {
            onLoadMore();
        }
    }, [hasNextPage, loading, onLoadMore, paginationModel.page, pageSize, rows.length]);

    // cambiando scope/filtri/ordinamento si riparte dalla prima pagina
    useEffect(() => {
        setPaginationModel((prev) =>
            prev.page === 0 ? prev : { ...prev, page: 0 }
        );
    }, [resetKey]);

    // altezza: si adatta alle righe della pagina corrente, tra un minimo e
    // un tetto massimo
    const pageRowCount = Math.min(
        pageSize,
        Math.max(rows.length - paginationModel.page * pageSize, 0)
    );
    const contentHeight =
        HEADER_HEIGHT + pageRowCount * ROW_HEIGHT + FOOTER_HEIGHT + GRID_EXTRA;
    const height = `min(${Math.max(contentHeight, minHeight)}px, ${maxHeight})`;

    return (
        <Box sx={{ height, width: "100%" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                rowHeight={ROW_HEIGHT}
                columnHeaderHeight={HEADER_HEIGHT}
                disableRowSelectionOnClick
                loading={loading}
                sortingMode={sortingMode}
                // con dati paginati dal BE il filtro nativo vedrebbe solo le
                // righe già scaricate: i filtri si fanno nella query
                disableColumnFilter={sortingMode === "server"}
                sortModel={sortModel}
                onSortModelChange={onSortModelChange}
                sortingOrder={["asc", "desc"]}
                pagination
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[pageSize]}
                localeText={{
                    paginationDisplayedRows: ({ from, to, count }) =>
                        totalCount !== null
                            ? `${from}–${to} di ${totalCount}`
                            : `${from}–${to} di ${count}${hasNextPage ? "+" : ""}`,
                }}
                getRowClassName={(params) => getRowClassName?.(params.row) ?? ""}
                sx={sx}
                disableColumnResize={loading}
                slotProps={{
                    loadingOverlay: {
                        variant: "linear-progress",
                        noRowsVariant: "linear-progress",
                    },
                }}
            />
        </Box>
    );
}