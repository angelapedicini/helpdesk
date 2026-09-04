import { SvgIconProps } from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CloudIcon from "@mui/icons-material/Cloud";
import StorageIcon from "@mui/icons-material/Storage";
import ChairIcon from "@mui/icons-material/Chair";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SchoolIcon from "@mui/icons-material/School";
import BuildIcon from "@mui/icons-material/Build";
import SecurityIcon from "@mui/icons-material/Security";
import FlightIcon from "@mui/icons-material/Flight";
import { ComponentType } from "react";
import { BudgetType } from "@/lib/validators/enums.schema";

type BudgetTypeConfig = {
  label: string;
  icon: ComponentType<SvgIconProps>;
  color: string;
};

export const BUDGET_TYPE_CONFIG = {
  NEW_HARDWARE: { label: "Nuovo hardware", icon: ComputerIcon, color: "text.primary" },
  SOFTWARE_LICENSE: { label: "Licenza software", icon: VpnKeyIcon, color: "text.primary" },
  CLOUD_SERVICES: { label: "Servizi cloud", icon: CloudIcon, color: "text.primary" },
  IT_INFRASTRUCTURE: { label: "Infrastruttura IT", icon: StorageIcon, color: "text.primary" },
  OFFICE_EQUIPMENT: { label: "Attrezzatura ufficio", icon: ChairIcon, color: "text.primary" },
  CONSULTING: { label: "Consulenza", icon: SupportAgentIcon, color: "text.primary" },
  TRAINING: { label: "Formazione", icon: SchoolIcon, color: "text.primary" },
  MAINTENANCE: { label: "Manutenzione", icon: BuildIcon, color: "text.primary" },
  SECURITY: { label: "Sicurezza", icon: SecurityIcon, color: "text.primary" },
  TRAVEL: { label: "Viaggi", icon: FlightIcon, color: "text.primary" },
} satisfies Record<BudgetType, BudgetTypeConfig>;