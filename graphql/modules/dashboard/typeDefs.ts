// modules/dashboard/typeDefs.ts

export const dashboardTypeDefs = `#graphql
  # L'enum e scritto qui per mano e non e generato: l'SDL viene letto da
  # strumenti statici (lint, editor, codegen) che non valutano le
  # interpolazioni dentro il template literal.
  enum DashboardList {
    RECENT_CREATED
    RECENT_ASSIGNED
    UPCOMING_DEADLINES
    RECENT_DEPARTMENT
    RECENT_ALL
  }

  # Due elenchi paralleli invece di uno solo: le liste ticket possono essere
  # piu di una per scope (il tecnico ha sia "ultimi assegnati" sia "prossime
  # scadenze"), i contatori invece sono uno per scope.
  type DashboardCounterGroup {
    scope: TicketScope!
    alerts: TicketAlerts!
  }

  type DashboardTicketList {
    list: DashboardList!
    tickets: [TicketInfo!]!
  }

  type Dashboard {
    counterGroups: [DashboardCounterGroup!]!
    ticketLists: [DashboardTicketList!]!
  }

  extend type Query {
    dashboard: Dashboard!
  }
`;
