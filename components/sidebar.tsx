// components/nav-sidebar/nav-sidebar.tsx
"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { NavLinkItem } from "./types/navlink";

type NavSidebarProps = {
  open: boolean;
  onClose: () => void;
  links?: NavLinkItem[];
  children?: ReactNode;
  anchor?: "left" | "right";
  width?: number;
};

export default function NavSidebar({
  open,
  onClose,
  links,
  children,
  anchor = "left",
  width = 250,
}: NavSidebarProps) {
  return (
    <Drawer open={open} onClose={onClose} anchor={anchor}>
      <Box sx={{ position: "relative", width, height: "100%" }}>
        {children ??
          (links && (
            <Box role="presentation" onClick={onClose}>
              <List>
                {links.map((link) => (
                  <ListItem key={link.href} disablePadding>
                    <ListItemButton component={Link} href={link.href}>
                      <ListItemIcon>{link.icon}</ListItemIcon>
                      <ListItemText primary={link.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider />
            </Box>
          ))}
        <IconButton
          size="small"
          aria-label="Chiudi"
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
    </Drawer>
  );
}