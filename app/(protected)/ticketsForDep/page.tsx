"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import {
    Badge,
    Box,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FiltersSidebar from "@/components/filters-sidebar";
import FilterTicketForm from "@/components/forms/ticket/filter-ticket";
import Modal from "@/components/modal";
import SureForm from "@/components/forms/sure-form";
import { useFilterState } from "@/components/hooks/use-filter-state";
import { useModalState } from "@/components/hooks/use-modal-state";
import { useSortState } from "@/components/hooks/use-sort-state";
import {
    TicketFieldsFragmentDoc,
    type TicketFieldsFragment,
    type TicketScope,
} from "@/apollo-client/gql/graphql";

import {
    GET_TICKETS,
    Ticket,
} from "@/apollo-client/queries/ticket/ticket.queries";

import { DELETE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";

import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";

import { FilterTicketOutput } from "@/lib/validators/ticket-detail.schema";
import { useFragment } from "@/apollo-client/gql";
import { isTicketOverdue } from "@/lib/ticket/expired-status";
import EnhancedTable from "@/components/table";
import { createTicketHeadCells, ticketSortFieldMap } from "@/lib/ticket/column.def";
import TicketRowActions from "@/components/ticket/actions";

const PAGE_SIZE = 20;

export default function TicketPage() {
    const router = useRouter();

    // --------------------------------
    // FILTRI
    // --------------------------------

    const ticketFilters = useFilterState<FilterTicketOutput>();

    // --------------------------------
    // SCOPE
    // --------------------------------

    const scope: TicketScope = "DEPARTMENT";

    // --------------------------------
    // SORT (stato controllato: guida sia la query BE che le frecce in tabella)
    // --------------------------------

    const { order, orderBy, onRequestSort, sortDirection } =
        useSortState<keyof TicketFieldsFragment>("id");

    // --------------------------------
    // QUERY
    // --------------------------------

    const queryVariables = {
        first: PAGE_SIZE,
        after: null,
        orderBy: {
            field: ticketSortFieldMap[orderBy] ?? "ID",
            direction: sortDirection,
        },
        scope,
        filter: ticketFilters.filter,
    };

    const { data, fetchMore } = useQuery(GET_TICKETS, {
        variables: queryVariables,
        notifyOnNetworkStatusChange: true,
    });

    // --------------------------------
    // TICKETS
    // --------------------------------

    const tickets: Ticket[] = useFragment(
        TicketFieldsFragmentDoc,
        data?.tickets?.edges?.map((edge) => edge.node) ?? []
    );

    // --------------------------------
    // PAGINATION
    // --------------------------------

    const { hasNextPage, loadMore } = useCursorPagination(
        data?.tickets?.pageInfo,
        fetchMore
    );

    // --------------------------------
    // DELETE MODAL
    // --------------------------------

    const deleteModal = useModalState<TicketFieldsFragment>();

    const [deleteTicket] = useMutation(DELETE_TICKET, {
        refetchQueries: [
            {
                query: GET_TICKETS,
                variables: queryVariables,
            },
        ],
    });

    const handleConfirmDelete = async () => {
        if (!deleteModal.value) {
            return;
        }

        const result = await deleteTicket({
            variables: { id: deleteModal.value.id },
            context: { successMessage: "Ticket eliminato con successo." },
        });

        if (result.error) {
            return;
        }

        deleteModal.close();
    };

    // --------------------------------
    // ACTIONS
    // --------------------------------

    const handleOpen = (ticket: TicketFieldsFragment) => {
        router.push(`/${ticket.id}`);
    };

    const handleHistory = (ticket: TicketFieldsFragment) => {
        router.push(`/ticketHistory/${ticket.id}`);
    };

    const handleMessage = (ticket: TicketFieldsFragment) => {
        router.push(`/ticketMessage/${ticket.id}`);
    };

    const handleDelete = (ticket: TicketFieldsFragment) => {
        deleteModal.open(ticket);
    };

    // --------------------------------
    // COLUMNS
    // --------------------------------

    const headCells = createTicketHeadCells({ scope });

    // --------------------------------
    // RENDER
    // --------------------------------

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 3 }}>
                <IconButton onClick={ticketFilters.open} aria-label="Filtri">
                    <Badge
                        badgeContent={ticketFilters.activeCount}
                        color="primary"
                        invisible={ticketFilters.activeCount === 0}
                    >
                        <FilterListIcon />
                    </Badge>
                </IconButton>

                <Typography variant="h5">I miei ticket</Typography>
            </Stack>

            <Box sx={{ height: "78vh" }}>
                <EnhancedTable<TicketFieldsFragment>
                    rows={tickets}
                    headCells={headCells}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={onRequestSort}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                    getRowClassName={(ticket) => (isTicketOverdue(ticket) ? "error-row" : undefined)}
                    actionsWidth="152px"
                    actions={(ticket) => (
                        <TicketRowActions
                            ticket={ticket}
                            scope={scope}
                            onOpen={handleOpen}
                            onHistory={handleHistory}
                            onDelete={handleDelete}
                            onMessage={handleMessage}

                        />
                    )}
                />
            </Box>

            {/* FILTRI */}
            <FiltersSidebar open={ticketFilters.isOpen} onClose={ticketFilters.close}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Filtri ticket
                    </Typography>

                    <FilterTicketForm
                        onApply={ticketFilters.apply}
                        onReset={ticketFilters.reset}
                    />
                </Box>
            </FiltersSidebar>

            {/* DELETE MODAL */}
            <Modal
                title="Elimina Ticket"
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
            >
                <SureForm
                    testo="eliminare"
                    onConfirm={handleConfirmDelete}
                    onCancel={deleteModal.close}
                />
            </Modal>
        </Box>
    );
}