import { Column } from "@/components/table";
import { Box, Icon, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
    Ticket,
    TicketSortField,
} from "@/apollo-client/queries/ticket/ticket.queries";

import { TICKET_PRIORITY_CONFIG } from "@/components/enums/ticket-priority.config";

import { toTicketSubject, type AppAbility } from "@/lib/casl/types";
import { TICKET_STATUS_CONFIG } from "@/components/enums/ticket-status-icon";

export function createTicketColumns(
    ability: AppAbility,
    onEdit: (row: Ticket) => void,
    onDelete: (row: Ticket) => void,
): Column<Ticket, TicketSortField>[] {
    return [
        {
            header: "Id",
            width: 70,
            sortField: "ID",
            render: (row) => row.id,
        },

        {
            header: "Titolo",
            width: 100,
            sortField: "TITLE",
            render: (row) => row.title,
        },
        {
            header: "Descrizione",
            width: 150,
            sortField: "DESCRIPTION",
            render: (row) => row.description,
        },
        {
            header: "Dipartimento",
            width: 150,
            sortField: "DESCRIPTION",
            render: (row) => row.ticketDepartment,
        },
         {
            header: "Categoria",
            width: 150,
            sortField: "DESCRIPTION",
            render: (row) => row.category?.name,
        },
        {
            header: "Stato",
            sortField: "STATUS",
            render: (row) => {
                const { label, icon: Icon, color } = TICKET_STATUS_CONFIG[row.status];

                return (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color, // <- applica il colore a tutto il Box (testo + icona)
                        }}
                    >
                        <Icon fontSize="small" sx={{ color }} />
                        {label}
                    </Box>
                );
            },
        },
        {
            header: "Priorità",
            sortField: "PRIORITY",
            render: (row) => {
                const { label, icon: Icon, color } = TICKET_PRIORITY_CONFIG[row.priority];

                return (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color,
                        }}
                    >
                        <Icon fontSize="small" sx={{ color }} />
                        {label}
                    </Box>
                );
            },
        },
        // {
        //     header: "Creato da",
        //     sortField: "CREATED_BY",
        //     render: (row) =>
        //         `${row.createdBy.firstName} ${row.createdBy.lastName}`,
        // },

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
            render: (row) =>
                new Date(row.createdAt).toLocaleDateString("it-IT"),
        },

        {
            header: "Aggiornato il",
            sortField: "UPDATED_AT",
            render: (row) =>
                new Date(row.updatedAt).toLocaleDateString("it-IT"),
        },

        {
            header: "Entro",
            sortField: "CLOSED_AT",
            render: (row) =>
                row.dueDate
                    ? new Date(row.dueDate).toLocaleDateString("it-IT")
                    : "-",
        },

        {
            header: "Chiuso",
            sortField: "CLOSED_AT",
            render: (row) =>
                row.closedAt
                    ? new Date(row.closedAt).toLocaleDateString("it-IT")
                    : "-",
        },

        {
            header: "Azioni",
            width: 110,
            render: (row) => {
                const ticketSubject = toTicketSubject(row);

                const canDelete = ability.can("delete", ticketSubject);

                const deleteReason = !canDelete
                    ? ability.relevantRuleFor("delete", ticketSubject)?.reason
                    : "";

                return (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 0.5,
                            flexWrap: "nowrap",
                        }}
                    >

                        <Tooltip
                            title={
                                canDelete
                                    ? ""
                                    : deleteReason || "Non eliminabile"
                            }
                        >
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