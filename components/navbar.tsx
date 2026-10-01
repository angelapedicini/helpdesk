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
import Popover from "@mui/material/Popover";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import { LOGOUT } from "@/apollo-client/queries/auth/logout/logout.mutation";
import { setNavigate } from "@/apollo-client/apollo-links/navigation";
import { NavLinkItem } from "./types/navlink";
import NavSidebar from "./sidebar";
import EasyLoginForm from "./forms/user/easyLogin";
import { useTicketNotifications } from "@/app/(protected)/dashboard/_components/hooks/useTicketNotifications";
import TicketNotificationsList from "@/app/(protected)/dashboard/_components/notification";

export default function Navbar({ links }: { links: NavLinkItem[] }) {
  const router = useRouter();
  const { data, loading } = useQuery(ME_QUERY);
  const { unread, notifications, count, openUnread, openNotification } = useTicketNotifications();
  const [open, setOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [notifAnchor, setNotifAnchor] = React.useState<null | HTMLElement>(null);
  const client = useApolloClient();
  const [logout] = useMutation(LOGOUT);

  const handleLogout = async () => {
    const result = await logout({});
    if (result.data?.logout.success) {
      await client.clearStore();
      router.replace("/");
    }
  };

  const toggleDrawer = (newOpen: boolean) => () => setOpen(newOpen);

  // Registra il router di Next nel modulo di navigazione, così
  // il link Apollo (che non può usare hook) può fare redirect client-side
  React.useEffect(() => {
    setNavigate((path) => router.replace(path));
  }, [router]);

  if (loading) return null;
  const user = data?.me;
  if (!user) return null;

  const handleNotifOpen = (e: React.MouseEvent<HTMLElement>) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

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
              <Badge badgeContent={count} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Popover
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { sx: { minWidth: 280, maxWidth: 360 } } }}
            >
              <TicketNotificationsList
                unread={unread}
                notifications={notifications}
                onOpenUnread={(id) => {
                  handleNotifClose();
                  openUnread(id);
                }}
                onOpenNotification={(id) => {
                  handleNotifClose();
                  openNotification(id);
                }}
              />
            </Popover>

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

            <IconButton color="inherit" onClick={handleLogout} title="Logout">
              <LogoutIcon />
            </IconButton>
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
          <EasyLoginForm stacked defaultDepartment={user.department} defaultEmail={user.email} onSubmitted={() => setLoginOpen(false)} />
        </Box>
      </NavSidebar>
    </>
  );
}