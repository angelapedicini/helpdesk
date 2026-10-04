"use client";

import { useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useFragment } from "@/graphql-generated/fragment-masking";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { GridSortModel } from "@mui/x-data-grid";

import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import { diffTicketHistory, type ChangedFields } from "@/lib/ticket/diff";
import ServerDataGrid from "@/components/server-data-grid";
import CardList from "@/components/card-list";
import { GET_TICKET_HISTORY_BY_TICKET_ID } from "@/apollo-client/queries/ticket-history/ticket-history.queries";
import { TICKET_HISTORY_FIELDS } from "@/apollo-client/queries/ticket-history/ticket-history.fragment";
import { useModalState } from "@/components/hooks/use-modal-state";
import Modal from "@/components/modal";
import TicketHistoryDetailModal from "./_components/ticket-history-detail-modal";
import { createTicketHistoryColumns, TicketHistoryRow } from "./column.def";

const PAGE_SIZE = 20;

// Lo storico non è ordinabile, ma ServerDataGrid richiede le props di sort.
// Costanti fuori dal componente per non creare riferimenti nuovi a ogni render.
const NO_SORT: GridSortModel = [];
const noop = () => { };

export default function TicketHistoryPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

    const params = useParams<{ id: string }>();
    const ticketId = Number(params.id);

    // --------------------------------
    // QUERY
    // --------------------------------

    const queryVariables = {
        ticketId,
        first: PAGE_SIZE,
        after: null,
    };

    const { data, fetchMore, loading } = useQuery(GET_TICKET_HISTORY_BY_TICKET_ID, {
        variables: queryVariables,
        notifyOnNetworkStatusChange: true,
    });

    // array stabile: cambia solo quando cambiano i dati della query
    const historyNodes = useMemo(
        () => data?.ticketHistoryByTicketId?.edges?.map((edge) => edge.node) ?? [],
        [data]
    );

    const history: TicketHistoryRow[] = useFragment(TICKET_HISTORY_FIELDS, historyNodes);

    // totalCount opzionale: se il BE non lo espone il footer mostra "N+"
    const totalCount =
        (data?.ticketHistoryByTicketId as { totalCount?: number | null } | undefined)
            ?.totalCount ?? null;

    const { hasNextPage, loadMore } = useCursorPagination(
        data?.ticketHistoryByTicketId?.pageInfo,
        fetchMore
    );

    // --------------------------------
    // DIFF (celle evidenziate)
    // --------------------------------

    const changedFieldsByRowId = useMemo(() => {
        const map = new Map<number, ChangedFields>();
        history.forEach((row, index) => {
            // history ordinata updatedAt DESC (più recente prima): la riga
            // "precedente" nel tempo è quella subito DOPO nell'array.
            // Se non è ancora caricata (ultima pagina scaricata) non
            // evidenziamo nulla finché non arriva con "carica altro".
            const previous = history[index + 1];
            map.set(row.id, diffTicketHistory(row, previous));
        });
        return map;
    }, [history]);

    // --------------------------------
    // DETAIL MODAL
    // --------------------------------

    const detailModal = useModalState<TicketHistoryRow>();

    const handleViewDetail = (row: TicketHistoryRow) => {
        detailModal.open(row);
    };

    const getCellClassName = (row: TicketHistoryRow, field: string) =>
        changedFieldsByRowId.get(row.id)?.has(field) ? "highlighted-cell" : undefined;

    const renderActions = (row: TicketHistoryRow) => (
        <Tooltip title="Dettaglio modifica" arrow>
            <IconButton
                color="primary"
                onClick={() => handleViewDetail(row)}
                aria-label="Dettaglio modifica"
            >
                <VisibilityIcon />
            </IconButton>
        </Tooltip>
    );

    // --------------------------------
    // COLUMNS (condivise tra DataGrid e CardList)
    // --------------------------------

    // renderActions e getCellClassName cambiano a ogni render, quindi li leggo
    // da un ref così `columns` resta stabile. Il ref è aggiornato nel corpo del
    // componente (non in un effect): la CardList legge cellClassName durante
    // il render stesso, e con un effect userebbe la mappa del render precedente.
    const callbacksRef = useRef({ renderActions, getCellClassName });
    callbacksRef.current = { renderActions, getCellClassName };

    const columns = useMemo(
        () =>
            createTicketHistoryColumns({
                renderActions: (row) => callbacksRef.current.renderActions(row),
                getCellClassName: (row, field) =>
                    callbacksRef.current.getCellClassName(row, field),
            }),
        []
    );

    // --------------------------------
    // RENDER
    // --------------------------------

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Storico ticket #{ticketId}
            </Typography>

            {isMobile ? (
                <CardList<TicketHistoryRow>
                    rows={history}
                    columns={columns}
                    titleKey="title"
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                />
            ) : (
                <ServerDataGrid<TicketHistoryRow>
                    rows={history}
                    columns={columns}
                    loading={loading}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                    totalCount={totalCount}
                    pageSize={PAGE_SIZE}
                    sortModel={NO_SORT}
                    onSortModelChange={noop}
                    resetKey={String(ticketId)}
                />
            )}

            <Modal
                title={`Dettaglio history ticket #${detailModal.value?.originalTicketId}`}
                isOpen={detailModal.isOpen}
                onClose={detailModal.close}
            >
                <TicketHistoryDetailModal
                    row={detailModal.value}
                    changedFields={
                        detailModal.value
                            ? changedFieldsByRowId.get(detailModal.value.id)
                            : undefined
                    }
                />
            </Modal>
        </Box>
    );
}