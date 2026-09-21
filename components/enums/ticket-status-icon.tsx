import { SvgIconProps } from "@mui/material";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ReplayIcon from "@mui/icons-material/Replay";
import { ComponentType } from "react";
import { TicketStatus } from "@/lib/validators/enums.schema";

type TicketStatusConfig = {
  label: string;
  icon: ComponentType<SvgIconProps>;
  color: string; // colore coerente col vecchio Chip color
};

export const TICKET_STATUS_CONFIG = {
  OPEN: {
    label: "Aperto",
    icon: RadioButtonUncheckedIcon,
    color: "info.main",
  },
  ASSIGNED: {
    label: "Assegnato",
    icon: AssignmentIndIcon,
    color: "primary.main",
  },
  IN_PROGRESS: {
    label: "In lavorazione",
    icon: AutorenewIcon,
    color: "warning.main",
  },
  CLOSED: {
    label: "Chiuso",
    icon: CheckCircleIcon,
    color: "success.main",
  },
  REFUSED: {
    label: "Rifiutato",
    icon: CancelIcon,
    color: "error.main",
  },
  REOPENED: {
    label: "Riaperto",
    icon: ReplayIcon,
    color: "secondary.main",
  },
} satisfies Record<TicketStatus, TicketStatusConfig>;