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

// Scope disponibili per la tabella dei ticket.
// Passato dalla pagina che monta la tabella (es. "ASSIGNED_TO_ME" nella pagina
// "I miei ticket assegnati", "DEPARTMENT" nella pagina di dipartimento, ecc.)
export type TicketScope = "ASSIGNED_TO_ME" | "DEPARTMENT" | "MINE";

// Estende Column aggiungendo un campo opzionale "scopes":
// - se omesso -> la colonna è visibile in tutti gli scope
// - se presente -> la colonna è visibile SOLO negli scope elencati
type ScopedColumn<T, S extends string> = Column<T, S> & {
    scopes?: TicketScope[];
};

export function createTicketColumns(
    ability: AppAbility,
    onEdit: (row: Ticket) => void,
    onDelete: (row: Ticket) => void,
    scope: TicketScope,
): Column<Ticket, TicketSortField>[] {
    const columns: ScopedColumn<Ticket, TicketSortField>[] = [
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
            // Non serve mostrare il dipartimento se sei già nella vista filtrata per dipartimento
            scopes: ["ASSIGNED_TO_ME", "MINE"],
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
        {
            header: "Creato da",
            sortField: "CREATED_BY",
            render: (row) =>
                `${row.createdBy.firstName} ${row.createdBy.lastName}`,
            scopes: ["ASSIGNED_TO_ME", "DEPARTMENT"],

        },

        {
            header: "Assegnato a",
            sortField: "ASSIGNED_TO",
            render: (row) =>
                row.assignedTo
                    ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}`
                    : "Non assegnato",
            // Ridondante nella vista "assegnati a me" (sei sempre tu)
            scopes: ["DEPARTMENT", "MINE"],
        },

        {
            header: "Creato il",
            sortField: "CREATED_AT",
            render: (row) =>
                new Date(row.createdAt).toLocaleDateString("it-IT"),
        },
        
        {
            header: "Aggiornato da",
            sortField: "ASSIGNED_TO",
            render: (row) =>
                row.lastUpdatedBy
                    ? `${row.lastUpdatedBy.firstName} ${row.lastUpdatedBy.lastName}`
                    : "-",
            // Ridondante nella vista "assegnati a me" (sei sempre tu)
            scopes: ["DEPARTMENT", "MINE"],
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
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
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

    return columns.filter((col) => !col.scopes || col.scopes.includes(scope));
}