// components/enums/department.config.tsx
import { SvgIconProps } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BadgeIcon from "@mui/icons-material/Badge";
import ComputerIcon from "@mui/icons-material/Computer";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import { ComponentType } from "react";
import { Department } from "@/lib/validators/enums.schema";

type DepartmentConfig = {
  label: string;
  icon: ComponentType<SvgIconProps>;
  color: string;
};

export const DEPARTMENT_CONFIG = {
  FINANCE: { label: "Finanza", icon: AccountBalanceIcon, color: "success.main" },
  HR: { label: "Risorse umane", icon: BadgeIcon, color: "primary.main" },
  IT: { label: "IT", icon: ComputerIcon, color: "info.main" },
  LOGISTIC: { label: "Logistica", icon: LocalShippingIcon, color: "warning.main" },
  SUPPORT: { label: "Supporto", icon: HeadsetMicIcon, color: "secondary.main" },
} satisfies Record<Department, DepartmentConfig>;