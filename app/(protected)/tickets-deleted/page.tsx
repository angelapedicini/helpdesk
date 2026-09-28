"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import HistoryIcon from "@mui/icons-material/History";

import { useFragment } from "@/graphql-generated/fragment-masking";
import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import EnhancedTable from "@/components/table";
import CardList from "@/components/card-list"; // NEW
import { GET_DELETED_TICKETS } from "@/apollo-client/queries/ticket-history/ticket-history.queries";
import { TICKET_HISTORY_FIELDS } from "@/apollo-client/queries/ticket-history/ticket-history.fragment";
import { createDeletedTicketHeadCells, type DeletedTicketRow } from "./column.def";
import type { TicketScope } from "@/graphql-generated/graphql";
import { TICKET_SCOPE_CONFIG } from "@/components/enums/ticket-scope.config";

const PAGE_SIZE = 20;

const VALID_SCOPES: TicketScope[] = ["ALL", "MINE", "DEPARTMENT", "ASSIGNED_TO_ME"];

export default function DeletedTicketsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // NEW: breakpoint mobile
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

    const scopeParam = searchParams.get("scope")?.toUpperCase();
    const scope: TicketScope = VALID_SCOPES.includes(scopeParam as TicketScope)
        ? (scopeParam as TicketScope)
        : "MINE";

    const title = TICKET_SCOPE_CONFIG[scope].deletedLabel;

    const queryVariables = {
        first: PAGE_SIZE,
        after: null,
        scope,
    };

    const { data, fetchMore } = useQuery(GET_DELETED_TICKETS, {
        variables: queryVariables,
        notifyOnNetworkStatusChange: true,
    });

    const deletedTickets: DeletedTicketRow[] =
        data?.deletedTickets?.edges?.map((edge) =>
            useFragment(TICKET_HISTORY_FIELDS, edge.node)
        ) ?? [];

    const { hasNextPage, loadMore } = useCursorPagination(
        data?.deletedTickets?.pageInfo,
        fetchMore
    );

    const handleHistory = (originalTicketId: number) => {
        router.push(`/tickets/${originalTicketId}/history`);
    };

    const headCells = createDeletedTicketHeadCells();

    // NEW: azioni condivise tra tabella e card
    const renderActions = (row: DeletedTicketRow) => (
        <IconButton
            aria-label="Vedi storico"
            onClick={() => handleHistory(row.originalTicketId)}
        >
            <HistoryIcon />
        </IconButton>
    );

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 3 }}>
                <Typography variant="h5">{title}</Typography>
            </Stack>

            {isMobile ? (
                <CardList<DeletedTicketRow>
                    rows={deletedTickets}
                    headCells={headCells}
                    titleKey={headCells[0]?.id}
                    actions={renderActions}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                />
            ) : (
                <Box sx={{ height: "78vh" }}>
                    <EnhancedTable<DeletedTicketRow>
                        rows={deletedTickets}
                        headCells={headCells}
                        hasNextPage={hasNextPage}
                        onLoadMore={loadMore}
                        actions={renderActions}
                    />
                </Box>
            )}
        </Box>
    );
}