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
import { NavLinkItem } from "./types/navlink";


type NavSidebarProps = {
  open: boolean;
  onClose: () => void;
  links: NavLinkItem[];
};

export default function NavSidebar({ open, onClose, links }: NavSidebarProps) {
  return (
    <Drawer open={open} onClose={onClose}>
      <Box sx={{ width: 250 }} role="presentation" onClick={onClose}>
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
    </Drawer>
  );
}