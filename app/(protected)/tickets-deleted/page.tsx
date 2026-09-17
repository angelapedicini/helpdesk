"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";

import { useFragment } from "@/graphql-generated/fragment-masking";
import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import EnhancedTable from "@/components/table";
import { GET_DELETED_TICKETS } from "@/apollo-client/queries/ticket-history/ticket-history.queries";
import { TICKET_HISTORY_FIELDS } from "@/apollo-client/queries/ticket-history/ticket-history.fragment";
import { createDeletedTicketHeadCells, type DeletedTicketRow } from "./column.def";
import type { TicketScope } from "@/graphql-generated/graphql";

const PAGE_SIZE = 20;

const SCOPE_TITLES: Record<TicketScope, string> = {
    MINE: "I miei ticket eliminati",
    ALL: "Tutti i ticket eliminati",
    DEPARTMENT: "Ticket eliminati del dipartimento",
    ASSIGNED_TO_ME: "Ticket eliminati assegnati a me",
};

const VALID_SCOPES: TicketScope[] = ["ALL", "MINE", "DEPARTMENT", "ASSIGNED_TO_ME"];

export default function DeletedTicketsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const scopeParam = searchParams.get("scope")?.toUpperCase();
    const scope: TicketScope = VALID_SCOPES.includes(scopeParam as TicketScope)
        ? (scopeParam as TicketScope)
        : "MINE";

    const title = SCOPE_TITLES[scope];

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

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 3 }}>
                <Typography variant="h5">{title}</Typography>
            </Stack>

            <Box sx={{ height: "78vh" }}>
                <EnhancedTable<DeletedTicketRow>
                    rows={deletedTickets}
                    headCells={headCells}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                    actions={(row) => (
                        <IconButton
                            aria-label="Vedi storico"
                            onClick={() => handleHistory(row.originalTicketId)}
                        >
                            <HistoryIcon />
                        </IconButton>
                    )}
                />
            </Box>
        </Box>
    );
}