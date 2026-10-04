"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import HistoryIcon from "@mui/icons-material/History";
import type { GridSortModel } from "@mui/x-data-grid";

import { useFragment } from "@/graphql-generated/fragment-masking";
import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import ServerDataGrid from "@/components/server-data-grid";
import CardList from "@/components/card-list";
import { GET_DELETED_TICKETS } from "@/apollo-client/queries/ticket-history/ticket-history.queries";
import { TICKET_HISTORY_FIELDS } from "@/apollo-client/queries/ticket-history/ticket-history.fragment";
import type { TicketScope } from "@/graphql-generated/graphql";
import { TICKET_SCOPE_CONFIG } from "@/components/enums/ticket-scope.config";
import { createDeletedTicketColumns, type DeletedTicketRow } from "./column.def";

const PAGE_SIZE = 20;

const VALID_SCOPES: TicketScope[] = ["ALL", "MINE", "DEPARTMENT", "ASSIGNED_TO_ME"];

// La lista non è ordinabile, ma ServerDataGrid richiede le props di sort.
// Costanti fuori dal componente per non creare riferimenti nuovi a ogni render.
const NO_SORT: GridSortModel = [];
const noop = () => {};

export default function DeletedTicketsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

    const scopeParam = searchParams.get("scope")?.toUpperCase();
    const scope: TicketScope = VALID_SCOPES.includes(scopeParam as TicketScope)
        ? (scopeParam as TicketScope)
        : "MINE";

    const title = TICKET_SCOPE_CONFIG[scope].deletedLabel;

    // --------------------------------
    // QUERY
    // --------------------------------

    const queryVariables = {
        first: PAGE_SIZE,
        after: null,
        scope,
    };

    const { data, fetchMore, loading } = useQuery(GET_DELETED_TICKETS, {
        variables: queryVariables,
        notifyOnNetworkStatusChange: true,
    });

    // array stabile: cambia solo quando cambiano i dati della query
    const deletedNodes = useMemo(
        () => data?.deletedTickets?.edges?.map((edge) => edge.node) ?? [],
        [data]
    );

    const deletedTickets: DeletedTicketRow[] = useFragment(
        TICKET_HISTORY_FIELDS,
        deletedNodes
    );

    // totalCount opzionale: se il BE non lo espone il footer mostra "N+"
    const totalCount =
        (data?.deletedTickets as { totalCount?: number | null } | undefined)
            ?.totalCount ?? null;

    const { hasNextPage, loadMore } = useCursorPagination(
        data?.deletedTickets?.pageInfo,
        fetchMore
    );

    // --------------------------------
    // ACTIONS
    // --------------------------------

    const handleHistory = (originalTicketId: number) => {
        router.push(`/tickets/${originalTicketId}/history`);
    };

    // azioni condivise tra DataGrid (desktop) e card (mobile)
    const renderActions = (row: DeletedTicketRow) => (
        <IconButton
            aria-label="Vedi storico"
            onClick={() => handleHistory(row.originalTicketId)}
        >
            <HistoryIcon />
        </IconButton>
    );

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
            createDeletedTicketColumns({
                renderActions: (row) => renderActionsRef.current(row),
            }),
        []
    );

    // --------------------------------
    // RENDER
    // --------------------------------

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 3 }}>
                <Typography variant="h5">{title}</Typography>
            </Stack>

            {isMobile ? (
                <CardList<DeletedTicketRow>
                    rows={deletedTickets}
                    columns={columns}
                    titleKey="title"
                    subtitleKey="originalTicketId"
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                />
            ) : (
                <ServerDataGrid<DeletedTicketRow>
                    rows={deletedTickets}
                    columns={columns}
                    loading={loading}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                    totalCount={totalCount}
                    pageSize={PAGE_SIZE}
                    sortModel={NO_SORT}
                    onSortModelChange={noop}
                    resetKey={scope}
                />
            )}
        </Box>
    );
}