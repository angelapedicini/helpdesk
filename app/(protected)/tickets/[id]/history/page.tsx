"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import { diffTicketHistory, type ChangedFields } from "@/lib/ticket/diff";
import EnhancedTable from "@/components/table";
import { GET_TICKET_HISTORY_BY_TICKET_ID } from "@/apollo-client/queries/ticket-history/ticket-history.queries";
import { createTicketHistoryHeadCells, TicketHistoryRow } from "./column.def";
import { useModalState } from "@/components/hooks/use-modal-state";
import Modal from "@/components/modal";
import TicketHistoryDetailModal from "./_components/ticket-history-detail-modal";
import VisibilityIcon from "@mui/icons-material/Visibility";

const PAGE_SIZE = 20;

export default function TicketHistoryPage() {
    const params = useParams<{ id: string }>();
    const ticketId = Number(params.id);

    const queryVariables = {
        ticketId,
        first: PAGE_SIZE,
        after: null,
    };

    const { data, fetchMore } = useQuery(GET_TICKET_HISTORY_BY_TICKET_ID, {
        variables: queryVariables,
        notifyOnNetworkStatusChange: true,
    });

    const history: TicketHistoryRow[] =
        data?.ticketHistoryByTicketId?.edges?.map((edge) => edge.node) ?? [];

    const { hasNextPage, loadMore } = useCursorPagination(
        data?.ticketHistoryByTicketId?.pageInfo,
        fetchMore
    );

    const changedFieldsByRowId = new Map<number, ChangedFields>();

    history.forEach((row, index) => {
        // history ordinata updatedAt DESC (più recente prima): la riga "precedente"
        // nel tempo è quella subito DOPO nell'array, non prima.
        // Se la riga successiva non è ancora caricata (ultima pagina scaricata),
        // semplicemente non evidenziamo nulla finché non arriva con "carica altro".
        const previous = history[index + 1];
        changedFieldsByRowId.set(row.id, diffTicketHistory(row, previous));
    });

    const detailModal = useModalState<TicketHistoryRow>();

    const handleViewDetail = (row: TicketHistoryRow) => {
        detailModal.open(row);
    };

    const headCells = createTicketHistoryHeadCells();

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Storico ticket #{ticketId}
            </Typography>

            <Box sx={{ height: "78vh" }}>
                <EnhancedTable<TicketHistoryRow>
                    rows={history}
                    headCells={headCells}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                    getCellClassName={(row, cellId) =>
                        changedFieldsByRowId.get(row.id)?.has(cellId as string)
                            ? "highlighted-cell"
                            : undefined
                    }
                    actions={(row) => (
                        <Tooltip title="Dettaglio modifica" arrow>
                            <IconButton
                                color="primary"
                                onClick={() => handleViewDetail(row)}
                                aria-label="Dettaglio modifica"
                            >
                                <VisibilityIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                />
            </Box>

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