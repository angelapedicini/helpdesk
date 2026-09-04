import { SvgIconProps } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import { ComponentType } from "react";
import { Customer } from "@/lib/validators/enums.schema";

type CustomerConfig = {
  label: string;
  icon: ComponentType<SvgIconProps>;
  color: string;
};

export const CUSTOMER_CONFIG = {
  ACME: { label: "Acme", icon: BusinessIcon, color: "text.primary" },
  MICROSOFT: { label: "Microsoft", icon: BusinessIcon, color: "text.primary" },
  GOOGLE: { label: "Google", icon: BusinessIcon, color: "text.primary" },
  AMAZON: { label: "Amazon", icon: BusinessIcon, color: "text.primary" },
  APPLE: { label: "Apple", icon: BusinessIcon, color: "text.primary" },
  IBM: { label: "IBM", icon: BusinessIcon, color: "text.primary" },
  ORACLE: { label: "Oracle", icon: BusinessIcon, color: "text.primary" },
  SAP: { label: "SAP", icon: BusinessIcon, color: "text.primary" },
  DELOITTE: { label: "Deloitte", icon: BusinessIcon, color: "text.primary" },
  ACCENTURE: { label: "Accenture", icon: BusinessIcon, color: "text.primary" },
} satisfies Record<Customer, CustomerConfig>;