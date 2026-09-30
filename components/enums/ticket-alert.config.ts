// components/enums/ticket-alert.config.ts

import type { TicketAlerts } from "@/graphql-generated/schema";
import type { FilterTicketOutput } from "@/lib/validators/ticket-detail.schema";

/**
 * I cinque alert di TicketAlerts, definiti una volta sola.
 *
 * Dashboard, pagina ticket e form filtri leggono da qui: la copy, il colore
 * e il legame con la chiave di filtro non possono divergere fra le tre,
 * perché ogni copia precedente li aveva legati a mano.
 *
 * key e filterKey non coincidono: `dueDateOverdue` è il campo di TicketAlerts
 * ma il filtro che produce si chiama `overdue`. Sono tipizzati entrambi, quindi
 * un refuso non compila.
 */

/**
 * I campi di TicketAlerts, così non si può citare un alert inesistente.
 * __typename escluso: il tipo generato lo porta dentro ogni oggetto GraphQL,
 * ma non è un contatore.
 */
export type TicketAlertKey = Exclude<keyof TicketAlerts, "__typename">;

/** Le chiavi di FilterTicketSchema che un alert può accendere. */
export type AlertFilterKey = Extract<
  keyof FilterTicketOutput,
  | "firstResponseOverdue"
  | "overdue"
  | "reopened"
  | "firstResponseDueSoon"
  | "dueDateDueSoon"
>;

export type TicketAlertDef = {
  key: TicketAlertKey;
  filterKey: AlertFilterKey;
  label: string;
  tone: "error" | "warning" | "info";
};

export const TICKET_ALERTS: TicketAlertDef[] = [
  {
    key: "firstResponseOverdue",
    filterKey: "firstResponseOverdue",
    label: "Prima risposta scaduta",
    tone: "error",
  },
  {
    key: "dueDateOverdue",
    filterKey: "overdue",
    label: "Scadenza scaduta",
    tone: "error",
  },
  {
    key: "reopened",
    filterKey: "reopened",
    label: "Riaperti",
    tone: "info",
  },
  {
    key: "firstResponseDueSoon",
    filterKey: "firstResponseDueSoon",
    label: "Prima risposta in scadenza",
    tone: "warning",
  },
  {
    key: "dueDateDueSoon",
    filterKey: "dueDateDueSoon",
    label: "Scadenza in arrivo",
    tone: "warning",
  },
];

/** Le chiavi accettate dal parametro ?filter= della pagina ticket. */
export const ALERT_FILTER_KEYS: AlertFilterKey[] = TICKET_ALERTS.map(
  (a) => a.filterKey
);

export function isAlertFilterKey(
  value: string | null
): value is AlertFilterKey {
  return value !== null && (ALERT_FILTER_KEYS as string[]).includes(value);
}
