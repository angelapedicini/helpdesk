"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { Box, Typography, Button, TextField, Stack } from "@mui/material";

import { GET_MESSAGES } from "@/apollo-client/queries/ticket-message/ticket-message.queries";
import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import TicketMessageThread, { type TicketMessageThreadHandle } from "@/components/chat";
import { CREATE_TICKET_MESSAGE } from "@/apollo-client/queries/ticket-message/ticket-massage.mutations";
import { MARK_TICKET_MESSAGES_READ } from "@/apollo-client/queries/ticket-read-state/ticket-read-state.mutation";

const PAGE_SIZE = 20;

export default function TicketMessagesPage() {
    const { id } = useParams();
    const ticketId = typeof id === "string" ? Number(id) : NaN;

    const [content, setContent] = useState("");
    const threadRef = useRef<TicketMessageThreadHandle>(null);

    // --------------------------------
    // ME
    // --------------------------------

    const { data: meData } = useQuery(ME_QUERY);
    const myId = meData?.me?.id;

    // --------------------------------
    // QUERY
    // --------------------------------

    const { data, fetchMore } = useQuery(GET_MESSAGES, {
        variables: { ticketId, first: PAGE_SIZE, after: null },
        skip: !Number.isInteger(ticketId),
        notifyOnNetworkStatusChange: true,
    });

    // --------------------------------
    // PAGINATION
    // --------------------------------

    const { hasNextPage, loadMore } = useCursorPagination(
        data?.messages?.pageInfo,
        fetchMore
    );

    // --------------------------------
    // CREATE MESSAGE
    // --------------------------------

    const [createMessage, { loading: sending }] = useMutation(CREATE_TICKET_MESSAGE, {
        refetchQueries: [
            {
                query: GET_MESSAGES,
                variables: { ticketId, first: PAGE_SIZE, after: null },
            },
        ],
        awaitRefetchQueries: true,
    });

    const handleSend = async () => {
        const trimmed = content.trim();
        if (!trimmed) return;

        const result = await createMessage({
            variables: { input: { ticketId, content: trimmed } },
        });

        if (!result.error) {
            setContent("");
            threadRef.current?.scrollToBottom();
        }
    };

    // --------------------------------
    // MESSAGES
    // --------------------------------

    const messages = data?.messages?.edges?.map((edge) => edge.node) ?? [];
    const orderedMessages = [...messages].reverse();

    // --------------------------------
    // RENDER
    // --------------------------------

    if (!Number.isInteger(ticketId)) {
        return <Typography align="center">ID ticket non valido.</Typography>;
    }

    // --------------------------------
    // MARK AS READ
    // --------------------------------

    const [markMessagesRead] = useMutation(MARK_TICKET_MESSAGES_READ
    );

    useEffect(() => {
        if (!Number.isInteger(ticketId)) return;

        markMessagesRead({
            variables: { ticketId },
            context: { silent: true },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId]);

    return (
        <Box
            sx={{
                width: "50vw",
                mx: "auto",
                mt: 3,
                height: "calc(100vh - 96px)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography variant="h5" sx={{ mb: 2, flexShrink: 0 }}>
                Messaggi ticket #{ticketId}
            </Typography>

            <Box sx={{ flex: 1, minHeight: 0 }}>
                <TicketMessageThread
                    ref={threadRef}
                    messages={orderedMessages}
                    myId={myId}
                    hasNextPage={hasNextPage}
                    onLoadMore={loadMore}
                />
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 2, flexShrink: 0 }}>
                <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="Scrivi un messaggio..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={sending || !content.trim()}
                >
                    Invia
                </Button>
            </Stack>
        </Box>
    );
}