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
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import { NAV_NOTIFICATIONS } from "@/apollo-client/queries/ticket-notification/ticket-notification.queries";
import { CLEAR_TICKET_NOTIFICATIONS } from "@/apollo-client/queries/ticket-notification/ticket-notification.mutation";
import { NavLinkItem } from "./types/navlink";
import NavSidebar from "./sidebar";
import { useMutation, useQuery } from "@apollo/client/react";
import EasyLoginForm from "./forms/user/easyLogin";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { setNavigate } from "@/apollo-client/apollo-links/navigation";
import type { ResultOf } from "@graphql-typed-document-node/core";

// Etichette italiane per i tipi di notifica ticket mostrati nella campanella.
type TicketNotificationLabelType = ResultOf<typeof NAV_NOTIFICATIONS>["ticketNotifications"][number]["type"];

const TICKET_NOTIFICATION_LABELS: Record<TicketNotificationLabelType, string> = {
  NEWTICKET: "Nuovo ticket",
  STATUS_CHANGED: "Stato cambiato",
  ASSIGNED: "Assegnazione",
  CATEGORY_CHANGED: "Categoria cambiata",
  PRIORITY_CHANGED: "Priorità cambiata",
  DATES_CHANGED: "Scadenze aggiornate",
};


export default function Navbar({ links }: { links: NavLinkItem[] }) {
  const router = useRouter();
  const { data, loading } = useQuery(ME_QUERY);
  const { data: notifData } = useQuery(NAV_NOTIFICATIONS);
  const [clearTicketNotifications] = useMutation(CLEAR_TICKET_NOTIFICATIONS, {
    context: { silent: true },
    refetchQueries: [NAV_NOTIFICATIONS],
  });
  const [open, setOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
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

  const unreadList = (notifData?.unreadTicketMessages ?? []).filter(
    (u) => !dismissedTicketIds.has(u.ticketId)
  );
  const notifications = notifData?.ticketNotifications ?? [];
  const totalUnread = unreadList.reduce((sum, u) => sum + u.count, 0) + notifications.length;

  const handleNotifOpen = (e: React.MouseEvent<HTMLElement>) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const handleNotifClick = (ticketId: number) => {
    setNotifAnchor(null);
    setDismissedTicketIds((prev) => new Set(prev).add(ticketId));
    router.push(`/tickets/${ticketId}/messages`);
  };

  const handleNotificationClick = (ticketId: number) => {
    setNotifAnchor(null);
    router.push(`/tickets/${ticketId}`);
    clearTicketNotifications({ variables: { ticketId } });
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
              {unreadList.length + notifications.length === 0 && (
                <MenuItem disabled>Nessuna notifica</MenuItem>
              )}
              {unreadList.length > 0 && (
                <MenuItem disabled sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary" }}>
                  Messaggi non letti
                </MenuItem>
              )}
              {unreadList.map((u) => (
                <MenuItem key={u.ticketId} onClick={() => handleNotifClick(u.ticketId)}>
                  Ticket #{u.ticketId} — {u.count} nuovi messaggi
                </MenuItem>
              ))}
              {notifications.length > 0 && (
                <MenuItem disabled sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary" }}>
                  Notifiche
                </MenuItem>
              )}
              {notifications.map((n) => (
                <MenuItem key={n.id} onClick={() => handleNotificationClick(n.ticket.id)}>
                  Ticket #{n.ticket.id} — {TICKET_NOTIFICATION_LABELS[n.type]}
                </MenuItem>
              ))}
            </Menu>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
                <EasyLoginForm defaultDepartment={user.department} defaultEmail={user.email} />
              </Box>
              <IconButton
                color="inherit"
                onClick={() => setLoginOpen(true)}
                sx={{ display: { xs: "inline-flex", sm: "none" } }}
              >
                <AccountCircleIcon />
              </IconButton>
            </Box>

            {/* <NavUser /> */}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <NavSidebar
        open={open}
        onClose={() => setOpen(false)}
        links={links}
      />
      <NavSidebar
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        anchor="right"
        width={320}
      >
        <Box sx={{ p: 2 }}>
          <EasyLoginForm stacked defaultDepartment={user.department} defaultEmail={user.email} />
        </Box>
      </NavSidebar>
    </>
  );
}