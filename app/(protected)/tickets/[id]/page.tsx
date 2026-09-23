
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useFragment } from "@/graphql-generated/fragment-masking";
import { GET_TICKET_BY_ID } from "@/apollo-client/queries/ticket/ticket.queries";
import { TicketFieldsFragmentDoc } from "@/graphql-generated/graphql";
import {
    Box,
    Collapse,
    List,
    ListItemButton,
    ListItemText,
    Skeleton,
    TextField,
    Typography,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import TicketDetailForm from "@/components/forms/ticket/update-ticket";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { Department } from "@/lib/validators/enums.schema";
import { toDatetimeLocalValue } from "@/lib/helper/date-helper";



export default function Page() {
    const { id } = useParams();

    const ticketId =
        typeof id === "string" ? Number(id) : NaN;

    const { data } = useQuery(GET_TICKET_BY_ID, {
        variables: { id: ticketId },
        skip: !Number.isInteger(ticketId),
    });

    const [metadataOpen, setMetadataOpen] = useState(true);

    if (!Number.isInteger(ticketId)) {
        return (
            <Typography align="center">
                ID ticket non valido.
            </Typography>
        );
    }

    const ticket = useFragment(
        TicketFieldsFragmentDoc,
        data?.ticket
    );

    if (!ticket) {
        return null;
    }

    return (
        <Box
            sx={{
                width: "100%",
                boxSizing: "border-box",
                p: { xs: 2, },
            }}
        >
            {/* <Typography variant="h4" sx={{ mb: 2 }}>
                Ticket # {ticket.id}
            </Typography> */}

            <Box
                sx={{
                    mb: 3,
                }}
            >
                <List component="nav" disablePadding>
                    <ListItemButton
                        className="dashboard-department"
                        onClick={() => setMetadataOpen((prev) => !prev)}
                        aria-expanded={metadataOpen}
                        aria-label={metadataOpen ? "Nascondi dettagli" : "Mostra dettagli"}
                        sx={{ mb: 2 }}
                    >
                        <ListItemText
                            primary={`Dettagli ticket #${ticket.id}`}
                        />

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

                        {/* <TextField
                    label="Reparto (ticket)"
                    value={ticket.ticketDepartment ?? ""}
                    fullWidth
                    disabled
                /> */}

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


            {/* Form modificabile */}

            <TicketDetailForm
                ticket={ticket}
                onSubmit={async (values) => {
                    // update ticket
                }}
            />

        </Box>
    );
}

