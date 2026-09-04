"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useFragment } from "@/apollo-client/gql/fragment-masking";

import {
    TicketSnapshotFieldsFragmentDoc,
} from "@/apollo-client/gql/graphql";

import { GET_TICKET_HISTORY } from "@/apollo-client/queries/ticket-history/ticket-history.queries";

import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import { useModalState } from "@/components/hooks/use-modal-state";

import { diffTickets } from "@/lib/ticket/diff";
import { createTicketHistoryHeadCells, TicketHistoryRow } from "./column.def";
import TicketHistoryDetailModal from "./_components/ticket-history-detail-modal";
import Modal from "@/components/modal";
import EnhancedTable from "@/components/table";

const PAGE_SIZE = 20;

export default function TicketHistoryPage() {
    const { id } = useParams();

    const ticketId = typeof id === "string" ? Number(id) : NaN;

    const { data, fetchMore } = useQuery(GET_TICKET_HISTORY, {
        variables: {
            ticketId,
            first: PAGE_SIZE,
        },
        skip: !Number.isInteger(ticketId),
        notifyOnNetworkStatusChange: true,
    });

    const { hasNextPage, loadMore } = useCursorPagination(
        data?.ticketHistory.pageInfo,
        fetchMore
    );

    // --------------------------------
    // DETAIL MODAL
    // --------------------------------

    const detailModal = useModalState<TicketHistoryRow>();

    const handleViewDetail = (row: TicketHistoryRow) => {
        detailModal.open(row);
    };

    if (!Number.isInteger(ticketId)) {
        return <Typography align="center">ID ticket non valido.</Typography>;
    }

    const rawHistory = data?.ticketHistory.edges.map((edge) => edge.node) ?? [];

    const snapshots = useFragment(
        TicketSnapshotFieldsFragmentDoc,
        rawHistory.map((history) => history.snapshotBefore)
    );

    const history: TicketHistoryRow[] = rawHistory.map((historyItem, index) => {
        const snapshot = snapshots[index];

        return {
            id: historyItem.id,
            ticketId: historyItem.ticketId,
            createdAt: historyItem.createdAt,

            title: snapshot.title,
            description: snapshot.description,
            status: snapshot.status,
            priority: snapshot.priority,

            category: snapshot.category
                ? snapshot.category.name
                : "Nessuna categoria",

            createdBy: snapshot.createdBy
                ? `${snapshot.createdBy.firstName} ${snapshot.createdBy.lastName}`
                : "-",

            assignedTo: snapshot.assignedTo
                ? `${snapshot.assignedTo.firstName} ${snapshot.assignedTo.lastName}`
                : "Non assegnato",

            updatedAt: snapshot.updatedAt,
            closedAt: snapshot.closedAt ?? null,
            dueDate: snapshot.dueDate ?? null,
            sourceDepartmentForUser: snapshot.sourceDepartmentForUser,
            ticketDepartment: snapshot.ticketDepartment,

            lastUpdatedBy: snapshot.lastUpdatedBy
                ? `${snapshot.lastUpdatedBy.firstName} ${snapshot.lastUpdatedBy.lastName}`
                : "-",

            closingMessage: snapshot.closingMessage ?? null,
            specificValue: snapshot.specificValue ?? null,

            changedFields: Array.from(diffTickets(snapshot, snapshots[index + 1])),
        };
    });

    const headCells = createTicketHistoryHeadCells();

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Ticket History
            </Typography>

            <Box sx={{ height: "78vh" }}>
                <EnhancedTable<TicketHistoryRow>
                    rows={history}
                    headCells={headCells}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                    getCellClassName={(row, cellId) =>
                        row.changedFields.includes(cellId as string) ? "highlighted-cell" : undefined
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
                title={`Dettaglio modifica #${detailModal.value?.id}`}
                isOpen={detailModal.isOpen}
                onClose={detailModal.close}
            >
                {/* DETAIL MODAL */}
                <TicketHistoryDetailModal
                    row={detailModal.value}
                />
            </Modal>
        </Box>
    );
}