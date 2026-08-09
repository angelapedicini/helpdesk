"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_TICKET_BY_ID } from "@/apollo-client/queries/ticket/ticket.queries";
import { Box, Skeleton, TextField, Typography } from "@mui/material";
import TicketDetailForm from "@/components/forms/ticket/ticket";

function toDatetimeLocalValue(value: unknown): string {
    if (!value) return "";
    const d = new Date(value as Date | string);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Page() {
    const { id } = useParams();
    const ticketId = typeof id === "string" ? Number(id) : NaN;

    const { data, loading } = useQuery(GET_TICKET_BY_ID, {
        variables: { id: ticketId },
        skip: !Number.isInteger(ticketId),
    });

    if (!Number.isInteger(ticketId)) {
        return <Typography align="center">ID ticket non valido.</Typography>;
    }

    if (loading) {
        return <Skeleton variant="rounded" height={600} sx={{ m: 4 }} />;
    }

    const ticket = data?.ticket;
    if (!ticket) return null;

    return (
        <Box sx={{ width: "100%", boxSizing: "border-box", p: { xs: 2, sm: 4 } }}>
            {/* --- dati non modificabili --- */}
            <Typography variant="h4" sx={{ mb: 5 }}>
                Ticker # {ticket.id}
            </Typography>



            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>

                <TextField
                    label="Creato da"
                    value={ticket.createdBy ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}` : ""}
                    fullWidth
                    disabled
                />

                <TextField label="Reparto (ticket)" value={ticket.ticketDepartment ?? ""} fullWidth disabled />

                <TextField label="Reparto (creatore)" value={ticket.sourceDepartmentForUser ?? ""} fullWidth disabled />

                <TextField
                    label="Creato il"
                    value={toDatetimeLocalValue(ticket.createdAt)}
                    type="datetime-local"
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                    label="Aggiornato il"
                    value={toDatetimeLocalValue(ticket.updatedAt)}
                    type="datetime-local"
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                    label="Chiuso il"
                    value={toDatetimeLocalValue(ticket.closedAt)}
                    type="datetime-local"
                    fullWidth
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                />
            </Box>

            {/* --- form modificabile --- */}
            <TicketDetailForm
                ticket={ticket}
                onSubmit={async (values) => {
                    // update ticket
                }}
            />
        </Box>
    );
}