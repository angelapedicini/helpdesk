// components/filters-sidebar/filters-sidebar.tsx
"use client";
import type { ReactNode } from "react";
import SidebarDrawer from "./side-drawer";

type FiltersSidebarProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function FiltersSidebar({ open, onClose, children }: FiltersSidebarProps) {
  return (
    <SidebarDrawer open={open} onClose={onClose} anchor="left"  width={320} heightVh={90}>
      {children}
    </SidebarDrawer>
  );
}