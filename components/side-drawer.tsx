// components/ui/sidebar-drawer.tsx
"use client";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import type { ReactNode } from "react";

type SidebarDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  anchor?: "left" | "right";
  heightVh?: number;
};

export default function SidebarDrawer({
  open,
  onClose,
  children,
  width = 250,
  anchor = "left",
  heightVh,
}: SidebarDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor={anchor}
      slotProps={{
        paper: heightVh
          ? {
              sx: {
                top: "auto",
                bottom: 0,
                height: `${heightVh}vh`,
              },
            }
          : undefined,
        root: {
          keepMounted: true, // mantiene il form montato quando chiudi
        },
      }}
    >
      <Box sx={{ width }} role="presentation">
        {children}
      </Box>
    </Drawer>
  );
}