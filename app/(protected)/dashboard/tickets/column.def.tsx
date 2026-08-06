import { Column } from "@/components/table";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Ticket, TicketSortField } from "@/apollo-client/queries/ticket/ticket.queries";

export function createTicketColumns(
    onEdit: (row: Ticket) => void,
    onDelete: (row: Ticket) => void,
): Column<Ticket, TicketSortField>[] {
    return [
        { header: "Id", width: 25, sortField: "ID", render: (row) => row.id },
        { header: "Titolo", width: 250, sortField: "TITLE", render: (row) => row.title },
        { header: "Descrizione", width: 300, sortField: "DESCRIPTION", render: (row) => row.description },
        {
            header: "Stato",
            sortField: "STATUS",
            render: (row) => (
                <Chip label={row.status} size="small" color={row.status === "CLOSED" ? "default" : "primary"} />
            ),
        },
        {
            header: "Priorità",
            sortField: "PRIORITY",
            render: (row) => (
                <Chip label={row.priority} size="small" color={row.priority === "URGENT" ? "default" : "primary"} />
            ),
        },
        // { header: "Categoria", sortField: "CATEGORY", render: (row) => row.category.name ?? "-" },
        // { header: "Reparto", sortField: "DEPARTMENT", render: (row) => row.category.department },
        {
            header: "Creato da",
            sortField: "CREATED_BY",
            render: (row) => `${row.createdBy.firstName} ${row.createdBy.lastName}`,
        },
        {
            header: "Assegnato a",
            sortField: "ASSIGNED_TO",
            render: (row) =>
                row.assignedTo ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}` : "Non assegnato",
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
            render: (row) => (row.closedAt ? new Date(row.closedAt).toLocaleDateString("it-IT") : "-"),
        },
        {
            header: "Azioni",
            width: 110,
            render: (row) => {
                const canDelete = row.status === "OPEN";

                return (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap" }}>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>

                        <Tooltip title={canDelete ? "" : "Non eliminabile: ticket già preso in carico"}>
                            <span>
                                <IconButton
                                    size="small"
                                    disabled={!canDelete}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(row);
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                );
            },
        },
    ];
}