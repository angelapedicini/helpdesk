// modules/ticket/resolvers/fields.ts

type TicketWithSpecifics = {
  ticketDepartment: string;
  itSpecific?: Record<string, unknown> | null;
  hrSpecific?: Record<string, unknown> | null;
  financeSpecific?: Record<string, unknown> | null;
  supportSpecific?: Record<string, unknown> | null;
  logisticSpecific?: Record<string, unknown> | null;
};

export const ticketFieldResolvers = {
  Ticket: {
    specificData: (ticket: TicketWithSpecifics) => {
      switch (ticket.ticketDepartment) {
        case "IT":
          return ticket.itSpecific
            ? { ...ticket.itSpecific, __typename: "TicketITSpecific" }
            : null;
        case "HR":
          return ticket.hrSpecific
            ? { ...ticket.hrSpecific, __typename: "TicketHRSpecific" }
            : null;
        case "FINANCE":
          return ticket.financeSpecific
            ? { ...ticket.financeSpecific, __typename: "TicketFinanceSpecific" }
            : null;
        case "SUPPORT":
          return ticket.supportSpecific
            ? { ...ticket.supportSpecific, __typename: "TicketSupportSpecific" }
            : null;
        case "LOGISTIC":
          return ticket.logisticSpecific
            ? { ...ticket.logisticSpecific, __typename: "TicketLogisticSpecific" }
            : null;
        default:
          return null;
      }
    },
  },

  TicketSpecific: {
    __resolveType: (obj: { __typename: string }) => obj.__typename,
  },
};