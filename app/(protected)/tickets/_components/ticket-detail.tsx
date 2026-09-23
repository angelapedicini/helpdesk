"use client";

import { useState } from "react";
import {
    Box,
    Collapse,
    List,
    ListItemButton,
    ListItemText,
    TextField,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import type { TicketFieldsFragment } from "@/graphql-generated/graphql";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { Department } from "@/lib/validators/enums.schema";
import { toDatetimeLocalValue } from "@/lib/helper/date-helper";

type TicketDetailProps = {
    ticket: TicketFieldsFragment;
};

export default function TicketDetail({ ticket }: TicketDetailProps) {
    const [metadataOpen, setMetadataOpen] = useState(true);

    return (
        <Box sx={{ mb: 1 }}>
            <List component="nav" disablePadding>
                <ListItemButton
                    className="dashboard-department"
                    onClick={() => setMetadataOpen((prev) => !prev)}
                    aria-expanded={metadataOpen}
                    aria-label={metadataOpen ? "Nascondi dettagli" : "Mostra dettagli"}
                    sx={{ mb: 2 }}
                >
                    <ListItemText primary={`Dettagli ticket #${ticket.id}`} />

                    {metadataOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
            </List>

            <Collapse in={metadataOpen} unmountOnExit>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "1fr 1fr",
                        },
                        gap: 3,
                        pb: 2,
                    }}
                >
                    <TextField
                        label="Creato da"
                        value={
                            ticket.createdBy
                                ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`
                                : ""
                        }
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Reparto (creatore)"
                        value={
                            ticket.sourceDepartmentForUser
                                ? (DEPARTMENT_CONFIG[ticket.sourceDepartmentForUser as Department]?.label ?? ticket.sourceDepartmentForUser)
                                : ""
                        }
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Creato il"
                        value={toDatetimeLocalValue(ticket.createdAt)}
                        type="datetime-local"
                        fullWidth
                        disabled
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                    />

                    <TextField
                        label="Aggiornato il"
                        value={toDatetimeLocalValue(ticket.updatedAt)}
                        type="datetime-local"
                        fullWidth
                        disabled
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                    />

                    <TextField
                        label="Chiuso il"
                        value={toDatetimeLocalValue(ticket.closedAt)}
                        type="datetime-local"
                        fullWidth
                        disabled
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                    />

                    <TextField
                        label="Numero riaperture"
                        value={ticket.reopenCount ?? 0}
                        fullWidth
                        disabled
                    />
                </Box>
            </Collapse>
        </Box>
    );
}