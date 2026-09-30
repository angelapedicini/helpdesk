// modules/dashboard/lists.ts

import type { Prisma } from "@/app/generated/prisma/client";
import type { DashboardList, TicketScope } from "@/graphql-generated/schema";

/**
 * Le liste ticket della dashboard.
 *
 * `list` è l'unica chiave che vede il frontend: da sola dice al client
 * il titolo da mettere, mentre qui sotto stanno scope e ordinamento.
 * Ogni lista filtrata via CASL semplicemente non viene restituita.
 */
export type DashboardListDef = {
  list: DashboardList;
  scope: TicketScope;
  orderBy: Prisma.TicketOrderByWithRelationInput;
};

export const dashboardListValues = [
  "RECENT_CREATED",
  "RECENT_ASSIGNED",
  "UPCOMING_DEADLINES",
  "RECENT_DEPARTMENT",
  "RECENT_ALL",
] as const satisfies readonly DashboardList[];

export const DASHBOARD_LISTS: DashboardListDef[] = [
  {
    list: "RECENT_CREATED",
    scope: "MINE",
    orderBy: { createdAt: "desc" },
  },
  {
    list: "RECENT_ASSIGNED",
    scope: "ASSIGNED_TO_ME",
    orderBy: { createdAt: "desc" },
  },
  {
    list: "UPCOMING_DEADLINES",
    scope: "ASSIGNED_TO_ME",
    // I ticket senza scadenza in coda, non in testa.
    orderBy: { dueDate: { sort: "asc", nulls: "last" } },
  },
  {
    list: "RECENT_DEPARTMENT",
    scope: "DEPARTMENT",
    orderBy: { createdAt: "desc" },
  },
  {
    list: "RECENT_ALL",
    scope: "ALL",
    orderBy: { createdAt: "desc" },
  },
];

// Gli scope che il resolver valuta uno a uno: tiene quelli che CASL consente.
export const ALL_TICKET_SCOPES: TicketScope[] = [
  "MINE",
  "ASSIGNED_TO_ME",
  "DEPARTMENT",
  "ALL",
];
