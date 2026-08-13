"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Box, Stack, Typography, IconButton, Badge } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

import AppTable from "@/components/table";
import type { SortState } from "@/components/table";
import { createTicketColumns } from "./column.def";

import { useModalState } from "@/components/hooks/use-modal-state";
import Modal from "@/components/modal";
import SureForm from "@/components/forms/sure-form";

import { useAbility } from "@/lib/casl/abilityContext";
import { TicketFieldsFragmentDoc, TicketScope } from "@/apollo-client/gql/graphql";

import {
    GET_TICKETS,
    Ticket,
    TicketSortField,
} from "@/apollo-client/queries/ticket/ticket.queries";
import { DELETE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";
import { useUnmaskedEdges } from "@/apollo-client/hooks/use-unmasked-edges";
import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import FiltersSidebar from "@/components/filters-sidebar";
import FilterTicketForm from "@/components/forms/ticket/filter-ticket";
import { useFilterState } from "@/components/hooks/use-filter-state";
import { FilterTicketOutput } from "@/lib/validators/ticket-detail.schema";

const PAGE_SIZE = 20;

export default function TicketForDepPage() {
    const router = useRouter();
    const ability = useAbility();

    // ---- FILTRI ----
    const ticketFilters = useFilterState<FilterTicketOutput>();

    // ---- SCOPE ----
    const scope: TicketScope = "DEPARTMENT";

    // ---- SORT ----
    const [sort, setSort] = useState<SortState<TicketSortField>>({
        field: "ID",
        direction: "DESC",
    });

    // ---- QUERY ----
    const queryVariables = {
        first: PAGE_SIZE,
        after: null,
        orderBy: sort ?? undefined,
        scope,
        filter: ticketFilters.filter,
    };

    const { data, loading, fetchMore } = useQuery(GET_TICKETS, {
        variables: queryVariables,
        notifyOnNetworkStatusChange: true,
    });

    const tickets = useUnmaskedEdges(data?.tickets, TicketFieldsFragmentDoc);
    const { hasNextPage, loadMore } = useCursorPagination(data?.tickets?.pageInfo, fetchMore);

    // ---- MODALS ----
    const ticketModal = useModalState<Ticket>();
    const deleteModal = useModalState<Ticket>();

    // ---- DELETE MUTATION ----
    const [deleteTicket, { loading: deleting }] = useMutation(DELETE_TICKET, {
        refetchQueries: [{ query: GET_TICKETS, variables: queryVariables }],
    });

    const handleConfirmDelete = async () => {
        if (!deleteModal.value) return;

        const result = await deleteTicket({
            variables: { id: deleteModal.value.id },
            context: { successMessage: "Ticket eliminato con successo." },
        });

        if (result.error) return;
        deleteModal.close();
    };

    // ---- COLUMNS ----
    const ticketColumns = useMemo(
        () => createTicketColumns(ability, ticketModal.open, deleteModal.open),
        [ability, ticketModal.open, deleteModal.open]
    );

    return (
        <Box sx={{ mt: 2, mx: 2 }}>
            <Stack
                direction="row"
                sx={{ justifyContent: "", alignItems: "center", mb: 2 }}
            >
                <IconButton onClick={ticketFilters.open}>
                    <Badge
                        badgeContent={ticketFilters.activeCount}
                        color="primary"
                        invisible={ticketFilters.activeCount === 0}
                    >
                        <FilterListIcon />
                    </Badge>
                </IconButton>
                <Typography variant="h5">Ticket del dipartimento</Typography>
            </Stack>

            <AppTable
                maxHeight="80vh"
                data={tickets}
                columns={ticketColumns}
                sort={sort}
                onSortChange={setSort}
                onLoadMore={loadMore}
                hasMore={hasNextPage}
                loadingMore={loading}
                keyExtractor={(row) => row.id}
                onRowClick={(row) => router.push(`/${row.id}`)}
            />

            <FiltersSidebar
                open={ticketFilters.isOpen}
                onClose={ticketFilters.close}
            >
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