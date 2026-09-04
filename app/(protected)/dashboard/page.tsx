"use client";

import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { useQuery } from "@apollo/client/react";
import {
    Box,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import CategoryIcon from "@mui/icons-material/Category";
import Link from "next/link";
import React from "react";

export default function Page() {
    const { data, loading } = useQuery(GET_CATEGORIES);

    const [openDepartments, setOpenDepartments] = React.useState<
        Record<string, boolean>
    >({});

    if (loading || !data) {
        return;
    }

    const categoriesByDepartment = data.categories.reduce(
        (acc, category) => {
            if (!acc[category.department]) {
                acc[category.department] = [];
            }

            acc[category.department].push(category);

            return acc;
        },
        {} as Record<string, typeof data.categories>
    );

    const handleClick = (department: string) => {
        setOpenDepartments((prev) => ({
            ...prev,
            [department]: !prev[department],
        }));
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                minHeight: "70vh",
                flexDirection: "column"
            }}
        >
            <Typography variant="h5">Seleziona dipartimento per apertura ticket e poi la sua categoria</Typography>
            <List
                component="nav"
                sx={{
                    width: "100%",
                    maxWidth: 500,
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    mt: 5,
                }}
            >
                {Object.entries(categoriesByDepartment).map(
                    ([department, categories]) => (
                        <Box key={department} sx={{ mb: 2 }}>
                            <ListItemButton
                                onClick={() => handleClick(department)}
                                sx={{
                                    border: "1px solid white",
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1.5,
                                    color: "inherit",
                                    backgroundColor: "black",


                                    "&:hover": {
                                        backgroundColor: "rgba(7, 6, 6, 0.08)",
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: "inherit",
                                        minWidth: 40,
                                    }}
                                >
                                    <FolderIcon />
                                </ListItemIcon>


                                <ListItemText primary={department} />

                                {openDepartments[department] ? (
                                    <ExpandLess />
                                ) : (
                                    <ExpandMore />
                                )}
                            </ListItemButton>

                            <Collapse
                                in={openDepartments[department]}
                                timeout="auto"
                                unmountOnExit
                            >


                                <List component="div" disablePadding>
                                    {categories.map((category) => (
                                        <ListItemButton
                                            key={category.id}
                                            component={Link}
                                            // href={`/newTicket/${category.department}`}
                                            href={`/newTicket/${category.department}/${category.id}`}
                                            sx={{
                                                border: "1px solid white",
                                                borderRadius: 2,
                                                px: 2,
                                                pl: 6,
                                                color: "inherit",
                                                ml: 2,


                                                "&:hover": {
                                                    backgroundColor:
                                                        "rgba(255,255,255,0.08)",
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    color: "inherit",
                                                    minWidth: 40,
                                                }}
                                            >
                                                <CategoryIcon />
                                            </ListItemIcon>

                                            <ListItemText primary={category.name} />
                                        </ListItemButton>
                                    ))}
                                    <Box sx={{mt:2}}>
                                        <Typography variant="h6">Non trovi quello che cerchi?</Typography>


                                        <ListItemButton
                                            component={Link}
                                            // href={`/newTicket/${category.department}`}
                                            href={`/newTicket/${department}`}
                                            sx={{
                                                border: "1px solid white",
                                                borderRadius: 2,
                                                px: 2,
                                                pl: 6,
                                                color: "inherit",
                                                ml: 2,
                                                mt: 1,


                                                "&:hover": {
                                                    backgroundColor:
                                                        "rgba(255,255,255,0.08)",
                                                },
                                            }}
                                        >

                                            <ListItemIcon
                                                sx={{
                                                    color: "inherit",
                                                    minWidth: 40,
                                                }}
                                            >
                                                <CategoryIcon />
                                            </ListItemIcon>

                                            <ListItemText primary={"Apri ticket generico"} />
                                        </ListItemButton>
                                    </Box>
                                </List>
                            </Collapse>
                        </Box>
                    )
                )}

            </List>
        </Box>
    );
}



