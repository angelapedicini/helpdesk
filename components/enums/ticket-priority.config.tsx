// components/enums/ticket-priority.config.ts
import { SvgIconProps } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { ComponentType } from "react";
import { TicketPriority } from "@/lib/validators/enums.schema";

type TicketPriorityConfig = {
  label: string;
  icon: ComponentType<SvgIconProps>;
  color: string;
};

export const TICKET_PRIORITY_CONFIG = {
  LOW: {
    label: "Bassa",
    icon: KeyboardArrowDownIcon,
    color: "success.main",
  },
  MEDIUM: {
    label: "Media",
    icon: RemoveIcon,
    color: "info.main",
  },
  HIGH: {
    label: "Alta",
    icon: KeyboardArrowUpIcon,
    color: "warning.main",
  },
  URGENT: {
    label: "Urgente",
    icon: PriorityHighIcon,
    color: "error.main",
  },
} satisfies Record<TicketPriority, TicketPriorityConfig>;