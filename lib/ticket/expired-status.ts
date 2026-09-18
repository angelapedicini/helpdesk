import { Ticket } from "@/apollo-client/queries/ticket/ticket.queries";

type OverdueKind = "firstResponse" | "work" | null;

type OverdueTicket = Pick<
    Ticket,
    "status" | "dueFirstResponse" | "dueDate" | "closedAt"
>;

const OVERDUE_LABELS: Record<Exclude<OverdueKind, null>, string> = {
    firstResponse: "In ritardo: revisione iniziale non ancora presa in carico",
    work: "In ritardo: lavorazione oltre la scadenza prevista",
};

export function getTicketOverdueKind(ticket: OverdueTicket): OverdueKind {
    // closedAt valorizzato = ticket risolto (CLOSED o REFUSED), mai scaduto
    if (ticket.closedAt != null) return null;

    const now = Date.now();

    if (ticket.status === "IN_PROGRESS") {
        if (!ticket.dueDate) return null;
        return new Date(ticket.dueDate).getTime() <= now ? "work" : null;
    }

    // OPEN o ASSIGNED: qui conta solo il primo riscontro
    if (!ticket.dueFirstResponse) return null;
    return new Date(ticket.dueFirstResponse).getTime() <= now ? "firstResponse" : null;
}

// Comodo per chi vuole solo il booleano/colore, senza distinguere il motivo
export function isTicketOverdue(ticket: OverdueTicket): boolean {
    return getTicketOverdueKind(ticket) !== null;
}

// Messaggio da mostrare nel tooltip della riga, se il ticket è in ritardo
export function getTicketOverdueTooltip(ticket: OverdueTicket): string | undefined {
    const kind = getTicketOverdueKind(ticket);
    return kind ? OVERDUE_LABELS[kind] : undefined;
}