import { Ticket } from "@/apollo-client/queries/ticket/ticket.queries";

export function isTicketOverdue(ticket: Pick<Ticket, "dueDate" | "closedAt">): boolean {
    // closedAt può essere null (ticket ancora aperto) oppure valorizzato
    // (ticket chiuso, quindi mai "scaduto" indipendentemente dalla dueDate)
    if (ticket.closedAt != null) return false;
    if (!ticket.dueDate) return false;

    const overdue = new Date(ticket.dueDate).getTime() <= Date.now();

    // TODO: rimuovere questo log una volta confermato il funzionamento
    console.log("isTicketOverdue", {
        dueDate: ticket.dueDate,
        closedAt: ticket.closedAt,
        overdue,
    });

    return overdue;
}