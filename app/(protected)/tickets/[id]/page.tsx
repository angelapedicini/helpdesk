"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useFragment } from "@/graphql-generated/fragment-masking";
import { GET_TICKET_BY_ID } from "@/apollo-client/queries/ticket/ticket.queries";
import { TicketFieldsFragmentDoc } from "@/graphql-generated/graphql";
import {
    Box,
    Typography,
} from "@mui/material";
import TicketDetailForm from "@/components/forms/ticket/update-ticket";
import TicketDetail from "../_components/ticket-detail";



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
                width: "100%",
                boxSizing: "border-box",
                pt: { xs: 2, },
            }}
        >
            {/* Form modificabile */}
            <TicketDetailForm
                ticket={ticket}
                header={<TicketDetail ticket={ticket} />}
                onSubmit={async (values) => {
                    // update ticket
                }}
            />

        </Box>
    );
}