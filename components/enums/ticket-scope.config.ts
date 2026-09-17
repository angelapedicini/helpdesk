// components/enums/ticket-scope.config.ts
import type { TicketScope } from "@/graphql-generated/graphql";

type TicketScopeConfig = {
  label: string;
  deletedLabel: string;
};

export const TICKET_SCOPE_CONFIG = {
  MINE: { label: "I miei ticket", deletedLabel: "I miei ticket eliminati" },
  ALL: { label: "Tutti i ticket", deletedLabel: "Tutti i ticket eliminati" },
  DEPARTMENT: {
    label: "Ticket del dipartimento",
    deletedLabel: "Ticket eliminati del dipartimento",
  },
  ASSIGNED_TO_ME: {
    label: "Ticket assegnati a me",
    deletedLabel: "Ticket eliminati assegnati a me",
  },
} satisfies Record<TicketScope, TicketScopeConfig>;