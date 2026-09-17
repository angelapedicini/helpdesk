"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { Box, Typography, Button, TextField, Stack, IconButton, Tooltip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";

import { GET_MESSAGES } from "@/apollo-client/queries/ticket-message/ticket-message.queries";
import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import TicketMessageThread, { type TicketMessageThreadHandle } from "@/components/chat";
import { CREATE_TICKET_MESSAGE } from "@/apollo-client/queries/ticket-message/ticket-massage.mutations";
import { MARK_TICKET_MESSAGES_READ } from "@/apollo-client/queries/ticket-read-state/ticket-read-state.mutation";
import { GET_TICKET_NOTIFICATION_SUBSCRIPTION } from "@/apollo-client/queries/ticket-adminNotificationSub/ticket-adminNotificationSub.queries";
import {
    SUBSCRIBE_TO_TICKET_NOTIFICATIONS,
    UNSUBSCRIBE_FROM_TICKET_NOTIFICATIONS,
} from "@/apollo-client/queries/ticket-adminNotificationSub/ticket-adminNotificationSub.mutation";
import NotificationBell from "@/components/notification-bell";
import { useTicketNotificationPermissions } from "@/lib/casl/abilities/ticket-notification/presentation";

const PAGE_SIZE = 20;

export default function TicketMessagesPage() {
    const { id } = useParams();
    const ticketId = typeof id === "string" ? Number(id) : NaN;
    const isValidTicketId = Number.isInteger(ticketId);

    const [content, setContent] = useState("");
    const threadRef = useRef<TicketMessageThreadHandle>(null);

    // --------------------------------
    // ME
    // --------------------------------

    const { data: meData } = useQuery(ME_QUERY);
    const myId = meData?.me?.id;
    const { canManageNotifications } = useTicketNotificationPermissions();

    // --------------------------------
    // QUERY MESSAGGI
    // --------------------------------

    const { data, fetchMore } = useQuery(GET_MESSAGES, {
        variables: { ticketId, first: PAGE_SIZE, after: null },
        skip: !isValidTicketId,
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
    // NOTIFICHE ADMIN
    // --------------------------------

    const { data: notificationData } = useQuery(GET_TICKET_NOTIFICATION_SUBSCRIPTION, {
        variables: { ticketId },
        skip: !isValidTicketId || !canManageNotifications,
    });

    const isSubscribed = !!notificationData?.ticketNotificationSubscription;

    const notificationRefetchQueries = [
        {
            query: GET_TICKET_NOTIFICATION_SUBSCRIPTION,
            variables: { ticketId },
        },
    ];

    const [subscribe, { loading: subscribing }] = useMutation(SUBSCRIBE_TO_TICKET_NOTIFICATIONS, {
        refetchQueries: notificationRefetchQueries,
        awaitRefetchQueries: true,
    });

    const [unsubscribe, { loading: unsubscribing }] = useMutation(UNSUBSCRIBE_FROM_TICKET_NOTIFICATIONS, {
        refetchQueries: notificationRefetchQueries,
        awaitRefetchQueries: true,
    });

    const handleToggleNotification = () => {
        if (isSubscribed) {
            unsubscribe({ variables: { ticketId } });
        } else {
            subscribe({ variables: { ticketId } });
        }
    };

    const notificationBusy = subscribing || unsubscribing;

    // --------------------------------
    // MESSAGES
    // --------------------------------

    const messages = data?.messages?.edges?.map((edge) => edge.node) ?? [];
    const orderedMessages = [...messages].reverse();

    // --------------------------------
    // MARK AS READ
    // --------------------------------

    const [markMessagesRead] = useMutation(MARK_TICKET_MESSAGES_READ);

    const markReadRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isValidTicketId) return;
        if (markReadRef.current === ticketId) return;

        markReadRef.current = ticketId;

        markMessagesRead({
            variables: { ticketId },
            context: { silent: true },
        });
    }, [ticketId, isValidTicketId, markMessagesRead]);

    // --------------------------------
    // RENDER
    // --------------------------------

    if (!isValidTicketId) {
        return <Typography align="center">ID ticket non valido.</Typography>;
    }

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
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2, flexShrink: 0 }}>
                <Typography variant="h5">
                    Messaggi ticket #{ticketId}
                </Typography>

                {canManageNotifications && (
                    <NotificationBell
                        isSubscribed={isSubscribed}
                        busy={notificationBusy}
                        onToggle={handleToggleNotification}
                    />
                )}
            </Stack>

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