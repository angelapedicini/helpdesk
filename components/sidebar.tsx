// components/nav-sidebar/nav-sidebar.tsx
"use client";
import Link from "next/link";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
// components/nav-sidebar/types.ts
import type { ReactNode } from "react";
import { NavLinkItem } from "./types/navlink";


type NavSidebarProps = {
  open: boolean;
  onClose: () => void;
  links: NavLinkItem[];
  userRole: "ADMIN" | "TECHNICIAN" | "EMPLOYEE";
};

export default function NavSidebar({ open, onClose, links, userRole }: NavSidebarProps) {
  const visibleLinks = links.filter(
    (link) => !link.roles || link.roles.includes(userRole)
  );

  return (
    <Drawer open={open} onClose={onClose}>
      <Box sx={{ width: 250 }} role="presentation" onClick={onClose}>
        <List>
          {visibleLinks.map((link) => (
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
    </Drawer>
  );
}