// app/(protected)/dashboard/dashboard-labels.ts
// La copy della dashboard sta qui. Il backend dice solo QUALI gruppi e
// QUALI liste esistono, mai con quali titoli: i testi restano nel frontend.

import type { DashboardList, TicketNotificationType, TicketScope, TicketStatus } from "@/graphql-generated/schema";
import type { CounterItem } from "./_components/counters";

export const TICKET_LIST_LABEL: Record<DashboardList, string> = {
    RECENT_CREATED: "Ultimi ticket creati",
    RECENT_ASSIGNED: "Ultimi assegnati a me",
    UPCOMING_DEADLINES: "Prossime scadenze",
    RECENT_DEPARTMENT: "Ultimi ticket del reparto",
    RECENT_ALL: "Ultimi ticket",
};

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
    OPEN: "Aperto",
    ASSIGNED: "Assegnato",
    IN_PROGRESS: "In lavorazione",
    CLOSED: "Chiuso",
    REFUSED: "Rifiutato",
    REOPENED: "Riaperto",
};

// Le chiavi dei cinque contatori: l'ordine non conta, ogni descrittore
// dice da quale campo di TicketAlerts prendere il valore.
type AlertKey =
    | "firstResponseOverdue"
    | "dueDateOverdue"
    | "reopened"
    | "firstResponseDueSoon"
    | "dueDateDueSoon";

export type AlertDescriptor = {
    key: AlertKey;
    label: string;
    tone: CounterItem["tone"];
    filter: string;
};

export const ALERT_DESCRIPTORS: AlertDescriptor[] = [
    { key: "firstResponseOverdue", label: "Prima risposta in ritardo", tone: "error", filter: "firstResponseOverdue" },
    { key: "dueDateOverdue", label: "Scadenza superata", tone: "error", filter: "overdue" },
    { key: "reopened", label: "Riaperti", tone: "warning", filter: "reopened" },
    { key: "firstResponseDueSoon", label: "Prima risposta in scadenza", tone: "warning", filter: "firstResponseDueSoon" },
    { key: "dueDateDueSoon", label: "Scadenza in arrivo", tone: "info", filter: "dueDateDueSoon" },
];

// Stessa forma dei link in components/nav-links.tsx: scope in minuscolo,
// la pagina tickets lo riporta maiuscolo con toUpperCase().
export function counterHref(scope: TicketScope, filter: string): string {
    return `/tickets?scope=${scope.toLowerCase()}&filter=${filter}`;
}

export const NOTIFICATION_ACTION: Record<TicketNotificationType, (ticketId: number) => string> = {
    NEWTICKET: (id) => `ha aperto il ticket #${id}`,
    STATUS_CHANGED: (id) => `ha aggiornato lo stato del ticket #${id}`,
    ASSIGNED: (id) => `ti ha assegnato il ticket #${id}`,
    CATEGORY_CHANGED: (id) => `ha cambiato la categoria del ticket #${id}`,
    PRIORITY_CHANGED: (id) => `ha cambiato la priorità del ticket #${id}`,
    DATES_CHANGED: (id) => `ha cambiato le scadenze del ticket #${id}`,
};

export const UNKNOWN_ACTOR = "Sistema";

export function formatDate(value: string | Date): string {
    return new Date(value).toLocaleDateString("it-IT");
}
