import { Role } from "@/lib/validators/enums.schema";
import { ReactNode } from "react";

export type NavLinkItem = {
  label: string;
  href: string;
  icon: ReactNode;
  roles?: Role[];
};