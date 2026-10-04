"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { Box, Typography, Stack } from "@mui/material";

import { GET_MESSAGES } from "@/apollo-client/queries/ticket-message/ticket-message.queries";
import { useCursorPagination } from "@/apollo-client/hooks/use-cursor-pagination";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import TicketMessageThread, { type TicketMessageThreadHandle } from "@/components/chat";
import TicketMessageForm from "@/components/forms/message/ticket-message-form";
import { MARK_TICKET_MESSAGES_READ } from "@/apollo-client/queries/ticket-read-state/ticket-read-state.mutation";
import { GET_TICKET_NOTIFICATION_SUBSCRIPTION } from "@/apollo-client/queries/ticket-adminNotificationSub/ticket-adminNotificationSub.queries";
import {
    SUBSCRIBE_TO_TICKET_NOTIFICATIONS,
    UNSUBSCRIBE_FROM_TICKET_NOTIFICATIONS,
} from "@/apollo-client/queries/ticket-adminNotificationSub/ticket-adminNotificationSub.mutation";
import NotificationBell from "@/components/notification-bell";
import { useTicketNotificationPermissions } from "@/lib/casl/abilities/ticket-notification/hook-permission";
import { NAV_NOTIFICATIONS } from "@/apollo-client/queries/ticket-notification/ticket-notification.queries";

const PAGE_SIZE = 20;

// Altezza della navbar su mobile: se la tua è diversa, cambia solo questo valore.
const MOBILE_NAVBAR_HEIGHT = 80;

export default function TicketMessagesPage() {
    const { id } = useParams();
    const ticketId = typeof id === "string" ? Number(id) : NaN;
    const isValidTicketId = Number.isInteger(ticketId);

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

    const [markMessagesRead] = useMutation(MARK_TICKET_MESSAGES_READ, {
        refetchQueries: [NAV_NOTIFICATIONS],
    });

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
                // Mobile: tutta la larghezza e tutta l'altezza sotto la navbar.
                // Desktop (md+): identico a prima.
                width: { xs: "100%", md: "50vw" },
                mx: "auto",
                mt: { xs: 0, md: 3 },
                px: { xs: 1.5, md: 0 },
                pt: { xs: 1.5, md: 0 },
                boxSizing: "border-box",
                // dvh segue la barra del browser mobile che appare/scompare;
                // con 100vh il campo di input finirebbe sotto la barra.
                height: {
                    xs: `calc(100dvh - ${MOBILE_NAVBAR_HEIGHT}px)`,
                    md: "90vh",
                },
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: { xs: 1, md: 2 },
                    flexShrink: 0,
                }}
            >
                <Typography
                    variant="h5"
                    noWrap
                    sx={{ minWidth: 0, fontSize: { xs: "1.15rem", md: undefined } }}
                >
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

            <Stack
                direction="row"
                spacing={1}
                sx={{
                    mt: { xs: 1, md: 2 },
                    // Su iPhone con la barra home in fondo, l'input non deve finirci sotto.
                    pb: { xs: "env(safe-area-inset-bottom, 0px)", md: 0 },
                    flexShrink: 0,
                }}
            >
                <TicketMessageForm
                    ticketId={ticketId}
                    pageSize={PAGE_SIZE}
                    onSent={() => threadRef.current?.scrollToBottom()}
                />
            </Stack>
        </Box>
    );
}