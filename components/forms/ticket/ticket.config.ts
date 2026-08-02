"use client";

import { z } from "zod";
import { TicketInputSchema } from "@/lib/validators/ticket.schema";
import { CREATE_TICKET } from "@/lib/apollo-client/queries/ticket/ticket.mutation";
import { GET_TICKETS, Ticket } from "@/lib/apollo-client/queries/ticket/ticket.queries";
import type { TicketsQueryVariables } from "@/lib/gql/graphql";
import { EntityFormConfig, FieldDef } from "@/components/form-engine/fieldDefs";
import { useAppLazyQuery } from "@/lib/apollo-client/hooks/lazy-query";
import { SEARCH_USERS } from "@/lib/apollo-client/queries/user/search";

type TicketFormInput = z.input<typeof TicketInputSchema>;
type TicketFormOutput = z.output<typeof TicketInputSchema>;

export function useTicketFormConfig(
    listVariables: TicketsQueryVariables,
): EntityFormConfig<TicketFormOutput, Ticket> {
    const { run: runSearchUsers } = useAppLazyQuery(SEARCH_USERS);

    const ticketFields: FieldDef[] = [
        { name: "title", label: "Titolo", type: "text" },
        { name: "description", label: "Descrizione", type: "textarea", minRows: 3 },
        // TODO: sostituire con select popolata da query categorie
        { name: "categoryId", label: "ID Categoria", type: "number" },
        {
            name: "assignedToId",
            label: "Assegnatario (opzionale)",
            type: "search",
            labelName: "assignedToLabel",
            searchFn: async (filter) => {
                const users = await runSearchUsers({ search: filter.search } as never);
                return (users ?? []).map((u) => ({
                    id: u.id,
                    label: `${u.firstName} ${u.lastName}`,
                }));
            },
        },
    ];

    return {
        schema: TicketInputSchema,
        defaultValues: {
            title: "",
            description: "",
            categoryId: undefined as unknown as number,
            assignedToId: undefined,
            assignedToLabel: "",
        } satisfies TicketFormOutput,
        mapToForm: (ticket) =>
            ({
                title: ticket.title,
                description: ticket.description,
                categoryId: Number(ticket.category?.id),
                assignedToId:
                    ticket.assignedTo?.id != null ? Number(ticket.assignedTo.id) : undefined,
                assignedToLabel: ticket.assignedTo
                    ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                    : "",
            }) satisfies TicketFormOutput,
        mapToMutationInput: (data) => {
            const { assignedToLabel, ...rest } = data;
            return rest as TicketFormOutput;
        },
        fields: ticketFields,
        createMutation: CREATE_TICKET,
        successMessage: "Ticket #{id} creato con successo.",
        listQuery: GET_TICKETS,
        listVariables: { ...listVariables, after: null },
    };
}