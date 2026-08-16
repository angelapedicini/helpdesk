"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";

import { Box, Typography } from "@mui/material";

import AppTable from "@/components/table";
import { useFragment } from "@/apollo-client/gql/fragment-masking";
import { TicketSnapshotFieldsFragmentDoc } from "@/apollo-client/gql/graphql";

import { GET_TICKET_HISTORY } from "@/apollo-client/queries/ticket-history/ticket-history.queries";
import { createTicketHistoryColumns, type TicketHistoryRow } from "./column.def";
import { diffTickets } from "@/lib/ticket/diff";
import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";

const PAGE_SIZE = 20;

export default function TicketHistoryPage() {
    const { id } = useParams();

    const ticketId = typeof id === "string" ? Number(id) : NaN;

    const { data, loading, fetchMore } = useQuery(GET_TICKET_HISTORY, {
        variables: { ticketId, first: PAGE_SIZE },
        skip: !Number.isInteger(ticketId),
        notifyOnNetworkStatusChange: true,
    });

    const { hasNextPage, loadMore } = useCursorPagination(
        data?.ticketHistory.pageInfo,
        fetchMore
    );

    if (!Number.isInteger(ticketId)) {
        return <Typography align="center">ID ticket non valido.</Typography>;
    }

    const rawHistory = data?.ticketHistory.edges.map((e) => e.node) ?? [];

    // Unmask qui: la pagina ha bisogno dei campi risolti per calcolare
    // il diff cross-riga, cosa che column.def non potrebbe fare
    // (riceve una riga alla volta, senza contesto sulla precedente).
    const snapshots = useFragment(
        TicketSnapshotFieldsFragmentDoc,
        rawHistory.map((h) => h.snapshotBefore)
    );

    // rawHistory è ordinato DESC (più recente prima), quindi
    // l'elemento "precedente" (più vecchio) è all'indice i + 1.
    const history: TicketHistoryRow[] = rawHistory.map((h, i) => ({
        id: h.id,
        ticketId: h.ticketId,
        createdAt: h.createdAt,
        ticket: snapshots[i],
        changedFields: diffTickets(snapshots[i], snapshots[i + 1]),
    }));

    const historyColumns = createTicketHistoryColumns();

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Ticket History
            </Typography>

            <AppTable
                maxHeight="75vh"
                data={history}
                columns={historyColumns}
                keyExtractor={(row) => row.id}
                onLoadMore={loadMore}
                hasMore={hasNextPage}
                loadingMore={loading}
            />
        </Box>
    );
}