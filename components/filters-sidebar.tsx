// components/filters-sidebar/filters-sidebar.tsx
"use client";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import SidebarDrawer from "./side-drawer";

type FiltersSidebarProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function FiltersSidebar({ open, onClose, children }: FiltersSidebarProps) {
  return (
    <SidebarDrawer open={open} onClose={onClose} anchor="left"  width={320} heightVh={99}>
      <Box sx={{ position: "relative", height: "100%" }}>
        {children}
        <IconButton
          size="small"
          aria-label="Chiudi filtri"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            color: "text.secondary",
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </SidebarDrawer>
  );
}