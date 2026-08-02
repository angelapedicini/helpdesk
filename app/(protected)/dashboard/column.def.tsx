// app/(protected)/dashboard/column.def.tsx
import { Column } from "@/components/table";
import { Chip } from "@mui/material";
import { Ticket, TicketSortField } from "@/lib/apollo-client/queries/ticket/ticket.queries";

export const ticketColumns: Column<Ticket, TicketSortField>[] = [
    {
        header: "Id",
        width: 25,
        sortField: "ID",
        render: (row) => row.id,
    },
    {
        header: "Titolo",
        width: 250,
        sortField: "TITLE",
        render: (row) => row.title,
    },
    {
        header: "Descrizione",
        width: 300,
        sortField: "DESCRIPTION",
        render: (row) => row.description,
    },
    {
        header: "Stato",
        sortField: "STATUS",
        render: (row) => (
            <Chip
                label={row.status}
                size="small"
                color={row.status === "CLOSED" ? "default" : "primary"}
            />
        ),
    },
    {
        header: "Categoria",
        sortField: "CATEGORY",
        render: (row) => row.category.name,
    },
    {
        header: "Reparto",
        sortField: "DEPARTMENT",
        render: (row) => row.category.department,
    },
    {
        header: "Creato da",
        sortField: "CREATED_BY",
        render: (row) => `${row.createdBy.firstName} ${row.createdBy.lastName}`,
    },
    {
        header: "Assegnato a",
        sortField: "ASSIGNED_TO",
        render: (row) =>
            row.assignedTo
                ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}`
                : "Non assegnato",
    },
    {
        header: "Creato il",
        sortField: "CREATED_AT",
        render: (row) => new Date(row.createdAt).toLocaleDateString("it-IT"),
    },
    {
        header: "Aggiornato il",
        sortField: "UPDATED_AT",
        render: (row) => new Date(row.updatedAt).toLocaleDateString("it-IT"),
    },
    {
        header: "Chiuso il",
        sortField: "CLOSED_AT",
        render: (row) =>
            row.closedAt ? new Date(row.closedAt).toLocaleDateString("it-IT") : "-",
    },
];