// components/enums/role.config.ts
import { SvgIconProps } from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import { ComponentType } from "react";
import { Role } from "@/lib/validators/enums.schema";

type RoleConfig = {
  label: string;
  icon: ComponentType<SvgIconProps>;
  color: string;
};

export const ROLE_CONFIG = {
  SYSTEM_ADMIN: {
    label: "Admin di sistema",
    icon: SecurityIcon,
    color: "error.dark",
  },
  ADMIN: {
    label: "Amministratore",
    icon: AdminPanelSettingsIcon,
    color: "error.main",
  },
  TECHNICIAN: {
    label: "Tecnico",
    icon: SupervisorAccountIcon,
    color: "warning.main",
  },
  EMPLOYEE: {
    label: "Dipendente",
    icon: SupportAgentIcon,
    color: "info.main",
  },
} satisfies Record<Role, RoleConfig>;   