"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Badge, Box, IconButton, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import type { GridSortModel } from "@mui/x-data-grid";
import FiltersSidebar from "@/components/filters-sidebar";
import FilterTicketForm from "@/components/forms/ticket/filter-ticket";
import TicketDetailForm from "@/components/forms/ticket/update-ticket";
import Modal from "@/components/modal";
import SureForm from "@/components/forms/sure-form";
import ServerDataGrid from "@/components/server-data-grid";
import { useTicketFilterState } from "@/components/hooks/use-ticket-filter-state";
import { useModalState } from "@/components/hooks/use-modal-state";
import {
    TicketFieldsFragmentDoc,
    type SortDirection,
    type TicketFieldsFragment,
    type TicketScope,
} from "@/graphql-generated/graphql";
import { GET_TICKETS, Ticket, ticketSortFieldMap, TICKET_ALERTS } from "@/apollo-client/queries/ticket/ticket.queries";
import { DELETE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";
import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import { FilterTicketInput } from "@/lib/validators/ticket-detail.schema";
import { useFragment } from "@/graphql-generated";
import { getTicketOverdueTooltip, isTicketOverdue } from "@/lib/ticket/expired-status";
import CardList from "@/components/card-list";
import TicketRowActions from "@/app/(protected)/tickets/_components/actions";
import TicketAlerts from "@/app/(protected)/tickets/_components/ticket-alerts";
import { TICKET_SCOPE_CONFIG } from "@/components/enums/ticket-scope.config";
import { GET_DELETED_TICKETS } from "@/apollo-client/queries/ticket-history/ticket-history.queries";
import { createTicketColumns } from "./_components/column.def";

const PAGE_SIZE = 20;

const VALID_SCOPES: TicketScope[] = ["ALL", "MINE", "DEPARTMENT", "ASSIGNED_TO_ME"];

export default function TicketsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

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

    // formKey va passata come key a FilterTicketForm: senza, il form resta
    // allineato solo al mount e un reset non gli spegne i checkbox.
    const ticketFilters = useTicketFilterState();

    // --------------------------------
    // SORT (lato server)
    // --------------------------------

    // Il default coincide con quello del backend (updatedAt desc), così
    // intestazione e dati restano coerenti.
    const [sortModel, setSortModel] = useState<GridSortModel>([
        { field: "updatedAt", sort: "desc" },
    ]);

    const activeSort = sortModel[0];
    const sortField = activeSort
        ? ticketSortFieldMap[activeSort.field as keyof TicketFieldsFragment]
        : undefined;

    // SortDirection è un tipo (unione di stringhe), non un enum
    const sortDirection: SortDirection =
        activeSort?.sort === "asc" ? "ASC" : "DESC";

    // --------------------------------
    // QUERY
    // --------------------------------

    const queryVariables = {
        first: PAGE_SIZE,
        after: null,
        orderBy:
            activeSort && sortField
                ? { field: sortField, direction: sortDirection }
                : undefined,
        scope,
        filter: ticketFilters.filter,
    };

    const { data, fetchMore, loading } = useQuery(GET_TICKETS, {
        variables: queryVariables,
        notifyOnNetworkStatusChange: true,
    });

    const { data: alertsData, loading: alertsLoading } = useQuery(TICKET_ALERTS, {
        variables: { scope },
    });

    // array stabile: cambia solo quando cambiano i dati della query
    const ticketNodes = useMemo(
        () => data?.tickets?.edges?.map((edge) => edge.node) ?? [],
        [data]
    );

    const tickets: Ticket[] = useFragment(TicketFieldsFragmentDoc, ticketNodes);

    // totalCount è OPZIONALE: finché la query/lo schema non lo espongono
    // resta null e il footer mostra "N+". Il cast evita errori di tipo se il
    // campo non è ancora nei tipi generati.
    const totalCount =
        (data?.tickets as { totalCount?: number | null } | undefined)?.totalCount ??
        null;

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
    // QUICK UPDATE MODAL
    // --------------------------------

    const quickUpdateModal = useModalState<TicketFieldsFragment>();

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

    const handleQuickUpdate = (ticket: TicketFieldsFragment) => {
        quickUpdateModal.open(ticket);
    };

    // azioni condivise tra DataGrid (desktop) e card (mobile)
    const renderActions = (ticket: TicketFieldsFragment) => (
        <TicketRowActions
            ticket={ticket}
            scope={scope}
            onOpen={handleOpen}
            onQuickUpdate={handleQuickUpdate}
            onHistory={handleHistory}
            onDelete={handleDelete}
            onMessage={handleMessage}
        />
    );

    const getRowClassName = (ticket: TicketFieldsFragment) =>
        isTicketOverdue(ticket) ? "error-row" : undefined;

    // --------------------------------
    // COLUMNS (condivise tra DataGrid e CardList)
    // --------------------------------

    // renderActions cambia a ogni render, quindi lo leggo da un ref sempre
    // aggiornato: così `columns` resta stabile e il grid non si ricalcola.
    const renderActionsRef = useRef(renderActions);
    useEffect(() => {
        renderActionsRef.current = renderActions;
    });

    const columns = useMemo(
        () =>
            createTicketColumns({
                scope,
                renderActions: (ticket) => renderActionsRef.current(ticket),
            }),
        [scope]
    );

    // --------------------------------
    // RENDER
    // --------------------------------

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 1 }}>
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
                    columns={columns}
                    titleKey="title"
                    subtitleKey="id"
                    hiddenKeys={["specificData"]}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                    getRowClassName={getRowClassName}
                    getRowTooltip={getTicketOverdueTooltip}
                />
            ) : (
                <ServerDataGrid<TicketFieldsFragment>
                    rows={tickets}
                    columns={columns}
                    loading={loading}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                    totalCount={totalCount}
                    pageSize={PAGE_SIZE}
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    resetKey={JSON.stringify([scope, ticketFilters.filter, sortModel])}
                    getRowClassName={getRowClassName}
                    
                />
            )}

            <FiltersSidebar open={ticketFilters.isOpen} onClose={ticketFilters.close}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Filtri ticket
                    </Typography>

                    <FilterTicketForm key={ticketFilters.formKey} onApply={ticketFilters.apply} onReset={ticketFilters.reset} scope={scope} enabled={ticketFilters.isOpen} defaultValues={ticketFilters.filter as FilterTicketInput} />
                </Box>
            </FiltersSidebar>

            <Modal title="Elimina Ticket" isOpen={deleteModal.isOpen} onClose={deleteModal.close}>
                <SureForm testo="eliminare" onConfirm={handleConfirmDelete} onCancel={deleteModal.close} />
            </Modal>

            <Modal
                title="Modifica rapida ticket"
                isOpen={quickUpdateModal.isOpen}
                onClose={quickUpdateModal.close}
            >
                {quickUpdateModal.value && (
                    <TicketDetailForm
                        // il ticket è riletto a ogni apertura: dopo una
                        // modifica riuscita la lista si ricarica e il
                        // form non deve mostrare i valori precedenti
                        key={quickUpdateModal.value.id}
                        ticket={quickUpdateModal.value}
                        variant="quick"
                        onSubmit={quickUpdateModal.close}
                    />
                )}
            </Modal>
        </Box>
    );
}