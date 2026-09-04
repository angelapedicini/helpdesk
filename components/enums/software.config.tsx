import { SvgIconProps } from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import { ComponentType } from "react";
import { Software } from "@/lib/validators/enums.schema";

type SoftwareConfig = {
  label: string;
  icon: ComponentType<SvgIconProps>;
  color: string;
};

// Nota: MUI non ha icone brand per ogni software; uso AppsIcon come icona generica
// per tutti — se preferisci le icone dei singoli brand, valuta @mui/icons-material
// non le copre tutte, servirebbe una libreria tipo simple-icons.
export const SOFTWARE_CONFIG = {
  JIRA: { label: "Jira", icon: AppsIcon, color: "text.primary" },
  SLACK: { label: "Slack", icon: AppsIcon, color: "text.primary" },
  MICROSOFT_TEAMS: { label: "Microsoft Teams", icon: AppsIcon, color: "text.primary" },
  OUTLOOK: { label: "Outlook", icon: AppsIcon, color: "text.primary" },
  EXCEL: { label: "Excel", icon: AppsIcon, color: "text.primary" },
  WORD: { label: "Word", icon: AppsIcon, color: "text.primary" },
  POWERPOINT: { label: "PowerPoint", icon: AppsIcon, color: "text.primary" },
  SAP: { label: "SAP", icon: AppsIcon, color: "text.primary" },
  SALESFORCE: { label: "Salesforce", icon: AppsIcon, color: "text.primary" },
  GITHUB: { label: "GitHub", icon: AppsIcon, color: "text.primary" },
  GITLAB: { label: "GitLab", icon: AppsIcon, color: "text.primary" },
  CONFLUENCE: { label: "Confluence", icon: AppsIcon, color: "text.primary" },
} satisfies Record<Software, SoftwareConfig>;