"use client";

import { useMemo, useState } from "react";
import Typography from "@mui/material/Typography";
import {
  Box,
  Stack,
  IconButton,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useRouter } from "next/navigation";

import AppTable from "@/components/table";
import { createTicketColumns } from "./column.def";

import { useModalState } from "@/components/hooks/use-modal-state";
import Modal from "@/components/modal";

import type { TicketFilterOutput } from "@/lib/validators/ticket.schema";

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
  TicketNode,
  TicketSortField,
} from "@/apollo-client/queries/ticket/ticket.queries";

import { DELETE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";

import EntityForm from "@/components/form-engine/entity-form";
import { useAbility } from "@/lib/casl/abilityContext";

import { useFragment } from "@/apollo-client/gql/fragment-masking";
import { TicketFieldsFragmentDoc } from "@/apollo-client/gql/graphql";

const PAGE_SIZE = 20;

export default function TicketsPage() {
  const router = useRouter();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const scope = "MINE";
  const ability = useAbility();

  // L'hook lavora sui dati raw/mascherati che arrivano da Apollo
  const {
    nodes: rawTickets,
    loading,
    hasNextPage,
    loadMore,
    sort,
    setSort,
    setFilter,
    queryVariables,
  } = useCursorPagination<TicketNode, TicketSortField>(
    GET_TICKETS,
    { scope },
    {
      pageSize: PAGE_SIZE,
      initialSort: {
        field: "ID",
        direction: "DESC",
      },
    }
  );

  // Smaschera i fragment: da qui in poi i ticket hanno i campi
  // reali (id, title, status, priority, ecc.) accessibili direttamente.
  const tickets: Ticket[] = useMemo(
    () => rawTickets.map((node) => useFragment(TicketFieldsFragmentDoc, node)),
    [rawTickets]
  );

  const ticketModal = useModalState<Ticket>();
  const deleteModal = useModalState<Ticket>();

  const ticketFormConfig = useTicketFormConfig(
    { ...queryVariables, after: null },
    ticketModal.value ?? undefined
  );

  const ticketFilterConfig = useTicketFilterFormConfig();

  const deleteTicket = useAppMutation(
    DELETE_TICKET,
    "Ticket eliminato con successo.",
    GET_TICKETS,
    {
      ...queryVariables,
      after: null,
    }
  );

  const ticketColumns = useMemo(
    () =>
      createTicketColumns(
        ability,
        ticketModal.open,
        deleteModal.open
      ),
    [
      ability,
      ticketModal.open,
      deleteModal.open,
    ]
  );

  const handleApplyFilter = (
    filter: TicketFilterOutput
  ) => {
    const activeValues = Object.values(filter).filter(
      (value) => value !== undefined
    );

    setActiveFilterCount(activeValues.length);

    setFilter(
      activeValues.length > 0
        ? filter
        : undefined
    );

    setFiltersOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.value) {
      return;
    }

    const result = await deleteTicket.mutate({
      id: deleteModal.value.id,
    } as never);

    if (result.error) {
      return;
    }

    deleteModal.close();
  };

  return (
    <Box sx={{ mt: 5, mx: 2 }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">
          I miei ticket
        </Typography>

        <IconButton
          onClick={() => setFiltersOpen(true)}
        >
          <FilterListIcon />
        </IconButton>
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
        onRowClick={(row) =>
          router.push(
            `/dashboard/tickets/${row.id}`
          )
        }
      />

      <FiltersSidebar
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2 }}
          >
            Filtri ticket
          </Typography>

          <FilterForm
            config={ticketFilterConfig}
            onApply={handleApplyFilter}
          />
        </Box>
      </FiltersSidebar>

      <Modal
        title={
          ticketModal.value
            ? "Modifica Ticket"
            : "Nuovo Ticket"
        }
        isOpen={ticketModal.isOpen}
        onClose={ticketModal.close}
      >
        <EntityForm
          config={ticketFormConfig}
          initialData={
            ticketModal.value ?? undefined
          }
          onCancel={ticketModal.close}
        />
      </Modal>

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