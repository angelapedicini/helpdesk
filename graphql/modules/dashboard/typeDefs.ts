// modules/dashboard/typeDefs.ts
import { dashboardListValues } from "./lists";

export const dashboardTypeDefs = `#graphql
  enum DashboardList {
    ${dashboardListValues.map((v) => `${v}`).join("\n    ")}
  }

  # Un gruppo di contatori per ogni scope che l'utente può leggere.
  # Il server decide quanti gruppi esistono, il frontend non sa nulla dei ruoli.
  type DashboardCounterGroup {
    scope: TicketScope!
    alerts: TicketAlerts!
  }

  # Tipo stretto: la dashboard non si porta dietro TICKET_INCLUDE.
  type DashboardTicket {
    id: Int!
    title: String!
    status: TicketStatus!
    createdAt: Date!
    dueDate: Date
  }

  type DashboardTicketList {
    list: DashboardList!
    tickets: [DashboardTicket!]!
  }

  type DashboardNotification {
    id: Int!
    type: TicketNotificationType!
    updatedAt: Date!
    ticketId: Int!
    actor: String
  }

  type Dashboard {
    counterGroups: [DashboardCounterGroup!]!
    ticketLists: [DashboardTicketList!]!
    notifications: [DashboardNotification!]!
  }

  extend type Query {
    dashboard: Dashboard!
  }
`;
