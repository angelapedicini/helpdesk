"use client";

"use client";

import { useMemo, useState } from "react";
import Typography from "@mui/material/Typography";
import { Box, Button, Stack, IconButton, Badge } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useRouter } from "next/navigation";
import AppTable from "@/components/table";
import { createTicketColumns } from "./column.def";
import { useModalState } from "@/components/hooks/use-modal-state";
import Modal from "@/components/modal";
import type { TicketFilterOutput } from "@/lib/validators/ticket.schema";
import EntityForm from "@/components/form-engine/entity-form";
import { useTicketFormConfig } from "@/components/forms/ticket/ticket.config";
import { useTicketFilterFormConfig } from "@/components/forms/ticket/ticket-filter.config";
import FilterForm from "@/components/form-engine/filter-form";
import SureForm from "@/components/forms/sure-form";
import FiltersSidebar from "@/components/filters-sidebar";
import { useCursorPagination } from "@/apollo-client/hooks/pagination-hook";
import { useAppMutation } from "@/apollo-client/hooks/mutation-hook";
import {
  GET_TICKETS,
  Ticket,
  TicketSortField,
  TicketScope,
} from "@/apollo-client/queries/ticket/ticket.queries";
import { DELETE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";

const PAGE_SIZE = 20;

export default function TicketsPage() {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const scope = "MINE";

  const {
    nodes: tickets,
    loading,
    hasNextPage,
    loadMore,
    sort,
    setSort,
    setFilter,
    queryVariables,
  } = useCursorPagination<Ticket, TicketSortField>(
    GET_TICKETS,
    { scope }, // fisso per pagina, non cambia con i filtri utente
    {
      pageSize: PAGE_SIZE,
      initialSort: { field: "ID", direction: "DESC" },
    }
  );

  const ticketModal = useModalState<Ticket>();
  const deleteModal = useModalState<Ticket>();

  const ticketFormConfig = useTicketFormConfig({ ...queryVariables, after: null });
  const ticketFilterConfig = useTicketFilterFormConfig();

  const deleteTicket = useAppMutation(
    DELETE_TICKET,
    "Ticket eliminato con successo.",
    GET_TICKETS,
    { ...queryVariables, after: null },
  );

  const ticketColumns = useMemo(
    () => createTicketColumns(ticketModal.open, deleteModal.open),
    [ticketModal.open, deleteModal.open],
  );

  const handleApplyFilter = (filter: TicketFilterOutput) => {
    const activeValues = Object.values(filter).filter((v) => v !== undefined);
    setActiveFilterCount(activeValues.length);
    setFilter(activeValues.length > 0 ? filter : undefined);
    setFiltersOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.value) return;

    const result = await deleteTicket.mutate({ id: deleteModal.value.id } as never);
    if (result.error) return;

    deleteModal.close();
  };

  return (
    <Box sx={{ mt: 5, mx: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => setFiltersOpen(true)}>
          <Badge badgeContent={activeFilterCount} color="primary">
            <FilterListIcon />
          </Badge>
        </IconButton>
        <Typography variant="h4">I miei ticket</Typography>
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
        onRowClick={(row) => router.push(`/dashboard/${row.id}`)}
      />

      <FiltersSidebar open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filtri ticket
          </Typography>
          <FilterForm config={ticketFilterConfig} onApply={handleApplyFilter} />
        </Box>
      </FiltersSidebar>
      
      <Modal title="Elimina Ticket" isOpen={deleteModal.isOpen} onClose={deleteModal.close}>
        <SureForm
          testo="eliminare"
          onConfirm={handleConfirmDelete}
          onCancel={deleteModal.close}
        />
      </Modal>
    </Box>
  );
}