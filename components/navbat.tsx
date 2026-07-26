"use client";
import * as React from "react";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import BarChartIcon from "@mui/icons-material/BarChart";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/lib/apollo-client/queries/user/me";
import NavUser from "./navuser";
import { useAppQuery } from "@/lib/apollo-client/hooks/query-hook";

export default function Navbar() {
    const { data, loading } = useAppQuery(ME_QUERY);
    const [open, setOpen] = React.useState(false);
    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    // loading: dati non ancora in cache (dovrebbe capitare raramente,
    // dato che SessionInitializer li semina prima del render di Navbar,
    // ma teniamolo per sicurezza / primo paint)
    if (loading) return null;
    const user = data;
    if (!user) return null;

    const isAdmin = user.roleName === "ADMIN";

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
                {isAdmin && (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/corso">
                            <ListItemIcon>
                                <DataObjectIcon />
                            </ListItemIcon>
                            <ListItemText primary="Corsi" />
                        </ListItemButton>
                    </ListItem>
                )}
                <ListItem disablePadding>
                    <ListItemButton component={Link} href="/assegnazione">
                        <ListItemIcon>
                            <DataObjectIcon />
                        </ListItemIcon>
                        <ListItemText primary="Assegnazioni" />
                    </ListItemButton>
                </ListItem>
                {isAdmin && (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/assegnazione/stats">
                            <ListItemIcon>
                                <BarChartIcon />
                            </ListItemIcon>
                            <ListItemText primary="Statistiche" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
            <Divider />
        </Box>
    );

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
                        <Link
                            href="/dashboard"
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <Typography variant="h6" component="div">
                                Academy
                            </Typography>
                        </Link>
                    </Box>
                    <NavUser />
                </Toolbar>
            </AppBar>
            <Toolbar />
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </>
    );
}