// components/navbar.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import { useAppQuery } from "@/apollo-client/hooks/query-hook";
import NavUser from "./navuser";
import { NavLinkItem } from "./types/navlink";
import NavSidebar from "./sidebar";


const NAV_LINKS: NavLinkItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <DataObjectIcon />,
    // nessun 'roles' => visibile a tutti
  },
  {
    label: "I miei ticket",
    href: "/dashboard/tickets",
    icon: <DataObjectIcon />,
    // nessun 'roles' => visibile a tutti
  }, 
    {
    label: "Ticket assegnati a me",
    href: "/dashboard/ticketsAssignedToMe",
    icon: <DataObjectIcon />,
    // nessun 'roles' => visibile a tutti
  }, 
  // {
  //   label: "Statistiche",
  //   href: "/assegnazione/stats",
  //   icon: <BarChartIcon />,
  //   roles: ["ADMIN"],
  // },
];

export default function Navbar() {
  const { data, loading } = useAppQuery(ME_QUERY);
  const [open, setOpen] = React.useState(false);
  const toggleDrawer = (newOpen: boolean) => () => setOpen(newOpen);

  if (loading) return null;
  const user = data;
  if (!user) return null;

  return (
    <>
      <AppBar position="fixed">
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", mx: 2 }}
          disableGutters
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
              <Typography variant="h6" component="div">
                Helpdesk
              </Typography>
            </Link>
          </Box>
          <NavUser />
        </Toolbar>
      </AppBar>
      <Toolbar />
      <NavSidebar
        open={open}
        onClose={() => setOpen(false)}
        links={NAV_LINKS}
        userRole={user.role}
      />
    </>
  );
}