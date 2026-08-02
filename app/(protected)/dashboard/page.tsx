// app/tickets/page.tsx
"use client";

import Typography from "@mui/material/Typography";
import { Box, Button, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import AppTable from "@/components/table";
import {
  GET_TICKETS,
  Ticket,
  TicketSortField,
} from "@/lib/apollo-client/queries/ticket/ticket.queries";
import { ticketColumns } from "./column.def";
import { useCursorPagination } from "@/lib/apollo-client/hooks/pagination-hook";
import { useModalState } from "@/components/hooks/use-modal-state";
import Modal from "@/components/modal";
import FilterPanel from "@/components/filter-panel";
import type { TicketFilterOutput } from "@/lib/validators/ticket.schema";
import { TicketFilterForm } from "@/components/forms/ticket/ticket-filter";
import EntityForm from "@/components/form-engine/entity-form";
import { useTicketFormConfig } from "@/components/forms/ticket/ticket.config";
import { useTicketFilterFormConfig } from "@/components/forms/ticket/ticket-filter.config";
import FilterForm from "@/components/form-engine/filter-form";

const PAGE_SIZE = 20;

export default function TicketsPage() {
  const router = useRouter();

  const {
    nodes: tickets,
    loading,
    hasNextPage,
    loadMore,
    sort,
    setSort,
    setFilter,
    queryVariables,
  } = useCursorPagination<Ticket, TicketSortField>(GET_TICKETS, undefined, {
    pageSize: PAGE_SIZE,
    initialSort: { field: "ID", direction: "DESC" },
  });

  const ticketModal = useModalState<Ticket>();

  const ticketFormConfig = useTicketFormConfig({ ...queryVariables, after: null });
  const ticketFilterConfig = useTicketFilterFormConfig();

  const handleApplyFilter = (filter: TicketFilterOutput) => {
    const hasActiveFilter = Object.values(filter).some((v) => v !== undefined);
    setFilter(hasActiveFilter ? filter : undefined);
  };

  return (
    <Box sx={{ mt: 5, mx: 2, display: "flex", gap: 2, alignItems: "flex-start" }}>
      <FilterPanel title="Filtri ticket">
        <FilterForm config={ticketFilterConfig} onApply={handleApplyFilter} />
      </FilterPanel>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4">I miei ticket</Typography>
          <Button onClick={ticketModal.openEmpty}>Nuovo Ticket</Button>
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

        <Modal title="Nuovo Ticket" isOpen={ticketModal.isOpen} onClose={ticketModal.close}>
          <EntityForm config={ticketFormConfig} onCancel={ticketModal.close} />
        </Modal>
      </Box>
    </Box>
  );
}