import { ReactNode } from "react";

export type NavLinkItem = {
  label: string;
  href: string;
  icon: ReactNode;
  roles?: Array<"ADMIN" | "TECHNICIAN" | "EMPLOYEE">; // se assente, visibile a tutti
};