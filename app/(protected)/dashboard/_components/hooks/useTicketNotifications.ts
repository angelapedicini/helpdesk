"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";

import { NAV_NOTIFICATIONS } from "@/apollo-client/queries/ticket-notification/ticket-notification.queries";
import { CLEAR_TICKET_NOTIFICATIONS } from "@/apollo-client/queries/ticket-notification/ticket-notification.mutation";

export function useTicketNotifications() {
    const router = useRouter();
    const { data } = useQuery(NAV_NOTIFICATIONS); // stessa query => cache condivisa
    const [clearTicketNotifications] = useMutation(CLEAR_TICKET_NOTIFICATIONS, {
        context: { silent: true },
        refetchQueries: [NAV_NOTIFICATIONS],
    });

    const unread = data?.unreadTicketMessages ?? [];
    const notifications = data?.ticketNotifications ?? [];
    const count = unread.reduce((sum, u) => sum + u.count, 0) + notifications.length;

    const openUnread = (ticketId: number) => {
        router.push(`/tickets/${ticketId}/messages`);
    };

    const openNotification = (ticketId: number) => {
        router.push(`/tickets/${ticketId}`);
        clearTicketNotifications({ variables: { ticketId } });
    };

    return { unread, notifications, count, openUnread, openNotification };
}