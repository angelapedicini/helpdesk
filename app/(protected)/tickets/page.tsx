"use client";

import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Badge, Box, IconButton, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
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
} from "@/graphql-generated/graphql";
import { GET_TICKETS, Ticket, ticketSortFieldMap, TICKET_ALERTS } from "@/apollo-client/queries/ticket/ticket.queries";
import { DELETE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";
import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import { FilterTicketInput, FilterTicketOutput } from "@/lib/validators/ticket-detail.schema";
import { useFragment } from "@/graphql-generated";
import { getTicketOverdueTooltip, isTicketOverdue } from "@/lib/ticket/expired-status";
import EnhancedTable from "@/components/table";
import CardList from "@/components/card-list"; // NEW
import { createTicketHeadCells } from "@/app/(protected)/tickets/_components/column.def";
import TicketRowActions from "@/app/(protected)/tickets/_components/actions";
import TicketAlerts from "@/app/(protected)/tickets/_components/ticket-alerts";
import { TICKET_SCOPE_CONFIG } from "@/components/enums/ticket-scope.config";
import { GET_DELETED_TICKETS } from "@/apollo-client/queries/ticket-history/ticket-history.queries";

const PAGE_SIZE = 20;

const VALID_SCOPES: TicketScope[] = ["ALL", "MINE", "DEPARTMENT", "ASSIGNED_TO_ME"];

export default function TicketsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // NEW: breakpoint mobile
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

    const scopeParam = searchParams.get("scope")?.toUpperCase();
    const scope: TicketScope = VALID_SCOPES.includes(scopeParam as TicketScope)
        ? (scopeParam as TicketScope)
        : "MINE";

    const title = TICKET_SCOPE_CONFIG[scope].label;

    // --------------------------------
    // FILTRI
    // --------------------------------

    const ticketFilters = useFilterState<FilterTicketOutput>();

    // --------------------------------
    // SORT
    // --------------------------------

    const { order, orderBy, onRequestSort, sortDirection } =
        useSortState<keyof TicketFieldsFragment>("updatedAt");

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

    const { data: alertsData, loading: alertsLoading } = useQuery(TICKET_ALERTS, {
        variables: { scope },
    });

    const tickets: Ticket[] = useFragment(
        TicketFieldsFragmentDoc,
        data?.tickets?.edges?.map((edge) => edge.node) ?? []
    );

    const { hasNextPage, loadMore } = useCursorPagination(
        data?.tickets?.pageInfo,
        fetchMore
    );

    // --------------------------------
    // DELETE MODAL
    // --------------------------------

    const deleteModal = useModalState<TicketFieldsFragment>();

    const [deleteTicket] = useMutation(DELETE_TICKET);

    const handleConfirmDelete = async () => {
        if (!deleteModal.value) return;

        const result = await deleteTicket({
            variables: { id: deleteModal.value.id },
            context: { successMessage: "Ticket eliminato con successo." },
            refetchQueries: [
                { query: GET_TICKETS, variables: queryVariables },
                { query: GET_DELETED_TICKETS, variables: queryVariables },
            ],
        });

        if (result.error) return;
        deleteModal.close();
    };

    // --------------------------------
    // ACTIONS
    // --------------------------------

    const handleOpen = (ticket: TicketFieldsFragment) => {
        router.push(`/tickets/${ticket.id}`);
    };

    const handleHistory = (ticket: TicketFieldsFragment) => {
        router.push(`/tickets/${ticket.id}/history`);
    };

    const handleMessage = (ticket: TicketFieldsFragment) => {
        router.push(`/tickets/${ticket.id}/messages`);
    };

    const handleDelete = (ticket: TicketFieldsFragment) => {
        deleteModal.open(ticket);
    };

    // NEW: azioni condivise tra tabella e card
    const renderActions = (ticket: TicketFieldsFragment) => (
        <TicketRowActions
            ticket={ticket}
            scope={scope}
            onOpen={handleOpen}
            onHistory={handleHistory}
            onDelete={handleDelete}
            onMessage={handleMessage}
        />
    );

    const getRowClassName = (ticket: TicketFieldsFragment) =>
        isTicketOverdue(ticket) ? "error-row" : undefined;

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

                <Typography variant="h5">{title}</Typography>
            </Stack>

            <TicketAlerts
                alerts={alertsData?.ticketAlerts}
                loading={alertsLoading}
                filter={ticketFilters.filter}
                onApply={ticketFilters.apply}
                onReset={ticketFilters.reset}
            />

            {isMobile ? (
                <CardList<TicketFieldsFragment>
                    rows={tickets}
                    headCells={headCells}
                    titleKey="title"
                    subtitleKey="id"
                    hiddenKeys={["specificData"]}
                    actions={renderActions}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                    getRowClassName={getRowClassName}
                    getRowTooltip={getTicketOverdueTooltip}
                />
            ) : (
                <EnhancedTable<TicketFieldsFragment>
                    rows={tickets}
                    headCells={headCells}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={onRequestSort}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                    getRowClassName={getRowClassName}
                    getRowTooltip={getTicketOverdueTooltip}
                    maxHeight={"70vh"}
                    actionsWidth="195px"
                    actions={renderActions}
                />
            )}

            <FiltersSidebar open={ticketFilters.isOpen} onClose={ticketFilters.close}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Filtri ticket
                    </Typography>

                    <FilterTicketForm onApply={ticketFilters.apply} onReset={ticketFilters.reset} scope={scope} enabled={ticketFilters.isOpen} defaultValues={ticketFilters.filter as FilterTicketInput} />
                </Box>
            </FiltersSidebar>

            <Modal title="Elimina Ticket" isOpen={deleteModal.isOpen} onClose={deleteModal.close}>
                <SureForm testo="eliminare" onConfirm={handleConfirmDelete} onCancel={deleteModal.close} />
            </Modal>
        </Box>
    );
}