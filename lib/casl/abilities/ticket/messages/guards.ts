// lib/casl/abilities/ticket/ticket-message.guards.ts
import { GraphQLError } from "graphql/error";
import { subject } from "@casl/ability";
import type { Ticket, TicketMessage } from "@/app/generated/prisma/client";
import { TicketAbility } from "../types";

/**
 * CREATE — non esiste ancora l'istanza del messaggio: la regola CASL dipende
 * dallo stato/relazioni del ticket padre, quindi costruiamo un subject
 * "finto" con la relazione ticket annidata, nella stessa forma usata
 * nelle condizioni di rules.ts (`{ ticket: { createdById, ... } }`).
 */
export function assertCanCreateTicketMessage(
    ability: TicketAbility,
    ticket: Pick<Ticket, "id" | "createdById" | "assignedToId" | "categoryId" | "ticketDepartment" | "status">
): void {
    const messageSubject = subject("TicketMessage", {
        ticketId: ticket.id,
        ticket: {
            id: ticket.id,
            createdById: ticket.createdById,
            assignedToId: ticket.assignedToId,
            categoryId: ticket.categoryId,
            ticketDepartment: ticket.ticketDepartment,
            status: ticket.status,
        },
    });

    if (ability.cannot("create", messageSubject)) {
        throw new GraphQLError("Non hai i permessi per scrivere in questo ticket", {
            extensions: { code: "FORBIDDEN" },
        });
    }
}

/**
 * DELETE — istanza già esistente, check diretto su authorId
 * (come da regola in rules.ts).
 */
export function assertCanDeleteTicketMessage(
    ability: TicketAbility,
    existing: TicketMessage
): void {
    const messageSubject = subject("TicketMessage", existing);

    if (ability.cannot("delete", messageSubject)) {
        throw new GraphQLError("Non hai i permessi per eliminare questo messaggio", {
            extensions: { code: "FORBIDDEN" },
        });
    }
}