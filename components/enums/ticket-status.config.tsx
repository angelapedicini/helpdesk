import { TicketStatus } from "@/lib/validators/ticket.schema";
import { Chip } from "@mui/material";
import { JSX } from "react/jsx-runtime";

type TicketStatusConfig = {
  label: string;
  chip: JSX.Element;
};

export const TICKET_STATUS_CONFIG = {
  OPEN: {
    label: "Aperto",
    chip: (
      <Chip
        label="Aperto"
        color="info"
        variant="outlined"
        size="small"
      />
    ),
  },
  ASSIGNED: {
    label: "Assegnato",
    chip: (
      <Chip
        label="Assegnato"
        color="primary"
        variant="outlined"
        size="small"
      />
    ),
  },
  IN_PROGRESS: {
    label: "In lavorazione",
    chip: (
      <Chip
        label="In lavorazione"
        color="warning"
        variant="outlined"
        size="small"
      />
    ),
  },
  CLOSED: {
    label: "Chiuso",
    chip: (
      <Chip
        label="Chiuso"
        color="success"
        variant="outlined"
        size="small"
      />
    ),
  },
  REFUSED: {
    label: "Rifiutato",
    chip: (
      <Chip
        label="Rifiutato"
        color="error"
        variant="outlined"
        size="small"
      />
    ),
  },
} satisfies Record<TicketStatus, TicketStatusConfig>;