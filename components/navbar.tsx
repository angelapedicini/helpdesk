// components/navbar.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import { UNREAD_TICKET_MESSAGES } from "@/apollo-client/queries/ticket-read-state/ticket-read-state.queries";
import { NavLinkItem } from "./types/navlink";
import NavSidebar from "./sidebar";
import { useQuery } from "@apollo/client/react";
import EasyLoginForm from "./forms/user/easyLogin";
import { setNavigate } from "@/apollo-client/apollo-links/navigation";


const NAV_LINKS: NavLinkItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <DataObjectIcon />,
  },
  {
    label: "I miei ticket",
    href: "/tickets?scope=mine",
    icon: <DataObjectIcon />,
  },
  {
    label: "Ticket assegnati a me",
    href: "/tickets?scope=assigned_to_me",
    icon: <DataObjectIcon />,
    roles: ["TECHNICIAN"],
  },
  {
    label: "Ticket del dipartimento",
    href: "/tickets?scope=department",
    icon: <DataObjectIcon />,
    roles: ["ADMIN"],
  },
  {
    label: "Tutti i ticket",
    href: "/tickets?scope=all",
    icon: <DataObjectIcon />,
    roles: ["SYSTEM_ADMIN"],
  },
  {
    label: "Specializzazioni",
    href: "/userCategory",
    icon: <DataObjectIcon />,
    roles: ["ADMIN", "TECHNICIAN", "SYSTEM_ADMIN"],
  },
  {
    label: "I miei ticket cancellati",
    href: "/tickets-deleted?scope=mine",
    icon: <DataObjectIcon />,
  },
  {
    label: "Ticket assegnati a me cancellati",
    href: "/tickets-deleted?scope=assigned_to_me",
    icon: <DataObjectIcon />,
    roles: ["TECHNICIAN"],
  },
  {
    label: "Ticket del dipartimento cancellati",
    href: "/tickets-deleted?scope=department",
    icon: <DataObjectIcon />,
    roles: ["ADMIN"],
  },
  {
    label: "Statistiche",
    href: "/stats",
    icon: <DataObjectIcon />,
    roles: ["ADMIN", "SYSTEM_ADMIN"],
  },
];

export default function Navbar() {
  const router = useRouter();
  const { data, loading } = useQuery(ME_QUERY);
  const { data: unreadData } = useQuery(UNREAD_TICKET_MESSAGES);
  const [open, setOpen] = React.useState(false);
  const [notifAnchor, setNotifAnchor] = React.useState<null | HTMLElement>(null);
  // ticketId visti localmente: nascosti dalla lista finché la query non
  // rifetcha e conferma (lato server) che non ci sono più messaggi non letti
  const [dismissedTicketIds, setDismissedTicketIds] = React.useState<Set<number>>(new Set());
  const toggleDrawer = (newOpen: boolean) => () => setOpen(newOpen);

  // AGGIUNTO: registra il router di Next nel modulo di navigazione, così
  // il link Apollo (che non può usare hook) può fare redirect client-side
  React.useEffect(() => {
    setNavigate((path) => router.replace(path));
  }, [router]);

  if (loading) return null;
  const user = data?.me;
  if (!user) return null;

  const unreadList = (unreadData?.unreadTicketMessages ?? []).filter(
    (u) => !dismissedTicketIds.has(u.ticketId)
  );
  const totalUnread = unreadList.reduce((sum, u) => sum + u.count, 0);

  const handleNotifOpen = (e: React.MouseEvent<HTMLElement>) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const handleNotifClick = (ticketId: number) => {
    setNotifAnchor(null);
    setDismissedTicketIds((prev) => new Set(prev).add(ticketId));
    router.push(`/tickets/${ticketId}/messages`);
  };

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



          <Box sx={{ display: "flex", alignItems: "center" }}>

            <IconButton color="inherit" onClick={handleNotifOpen} sx={{ mr: 1 }}>
              <Badge badgeContent={totalUnread} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={handleNotifClose}>
              {unreadList.length === 0 && <MenuItem disabled>Nessuna notifica</MenuItem>}
              {unreadList.map((u) => (
                <MenuItem key={u.ticketId} onClick={() => handleNotifClick(u.ticketId)}>
                  Ticket #{u.ticketId} — {u.count} nuovi messaggi
                </MenuItem>
              ))}
            </Menu>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <EasyLoginForm defaultDepartment={user.department} defaultEmail={user.email} />
            </Box>

            {/* <NavUser /> */}
          </Box>
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