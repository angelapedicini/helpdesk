"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";

import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Typography,
} from "@mui/material";

import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status.config";


import { useFragment } from "@/apollo-client/gql/fragment-masking";
import { GET_TICKET_BY_ID } from "@/apollo-client/queries/ticket/ticket.queries";
import { TicketFieldsFragmentDoc } from "@/apollo-client/gql/graphql";

export default function Page() {
    const { id } = useParams();

    const ticketId =
        typeof id === "string" ? Number(id) : NaN;

    const { data } = useQuery(GET_TICKET_BY_ID, {
        variables: { id: ticketId },
        skip: !Number.isInteger(ticketId),
    });

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
                minHeight: "50vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Box sx={{ width: "100%", maxWidth: 700, p: 2 }}>
                <Card>
                    <CardHeader
                        title={`Ticket #${ticket.id}`}
                        subheader={`${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`}
                        action={
                            TICKET_STATUS_CONFIG[ticket.status].chip
                        }
                    />

                    <Divider />

                    <CardContent
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <Box>
                            <strong>Titolo:</strong> {ticket.title}
                        </Box>

                        <Box>
                            <strong>Descrizione:</strong> {ticket.description}
                        </Box>

                        <Box>
                            <strong>Priorità:</strong>{" "}
                            <Chip
                                label={ticket.priority}
                                size="small"
                                color={
                                    ticket.priority === "URGENT"
                                        ? "default"
                                        : "primary"
                                }
                            />
                        </Box>

                        <Box>
                            <strong>Categoria:</strong>{" "}
                            {ticket.category?.name ?? "-"}
                        </Box>

                        <Box>
                            <strong>Creato da:</strong>{" "}
                            {ticket.createdBy.firstName}{" "}
                            {ticket.createdBy.lastName}
                        </Box>

                        <Box>
                            <strong>Assegnato a:</strong>{" "}
                            {ticket.assignedTo
                                ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                                : "-"}
                        </Box>

                        <Box>
                            <strong>Data creazione:</strong>{" "}
                            {new Date(ticket.createdAt).toLocaleString("it-IT")}
                        </Box>

                        <Box>
                            <strong>Ultimo aggiornamento:</strong>{" "}
                            {new Date(ticket.updatedAt).toLocaleString("it-IT")}
                        </Box>

                        <Box>
                            <strong>Chiuso il:</strong>{" "}
                            {ticket.closedAt
                                ? new Date(ticket.closedAt).toLocaleString("it-IT")
                                : "-"}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}