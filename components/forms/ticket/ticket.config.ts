"use client";

import { z } from "zod";
import { TicketInputSchema } from "@/lib/validators/ticket.schema";
import { CREATE_TICKET } from "@/lib/apollo-client/queries/ticket/ticket.mutation";
import { GET_TICKETS, Ticket } from "@/lib/apollo-client/queries/ticket/ticket.queries";
import type { TicketsQueryVariables } from "@/lib/gql/graphql";
import { EntityFormConfig, FieldDef } from "@/components/form-engine/fieldDefs";
import { useAppLazyQuery } from "@/lib/apollo-client/hooks/lazy-query";
import { useAppQuery } from "@/lib/apollo-client/hooks/query-hook";
import { SEARCH_USERS } from "@/lib/apollo-client/queries/user/search";
import { GET_CATEGORIES } from "@/lib/apollo-client/queries/ticket-category/ticket-category.queries";

type TicketFormInput = z.input<typeof TicketInputSchema>;
type TicketFormOutput = z.output<typeof TicketInputSchema>;

export function useTicketFormConfig(
  listVariables: TicketsQueryVariables,
  initialData?: Ticket,
): EntityFormConfig<TicketFormOutput, Ticket> {
  const { run: runSearchUsers } = useAppLazyQuery(SEARCH_USERS);
  const { data: categories } = useAppQuery(GET_CATEGORIES);

  const categoryOptions = (categories ?? []).map((c) => ({
    id: c.id,
    label: c.name,
  }));

  const assignedToInitialLabel = initialData?.assignedTo
    ? `${initialData.assignedTo.firstName} ${initialData.assignedTo.lastName}`
    : undefined;

  const ticketFields: FieldDef[] = [
    { name: "title", label: "Titolo", type: "text" },
    { name: "description", label: "Descrizione", type: "textarea", minRows: 3 },
    {
      name: "categoryId",
      label: "Categoria",
      type: "select",
      options: categoryOptions,
    },
    {
      name: "assignedToId",
      label: "Assegnatario (opzionale)",
      type: "search",
      initialLabel: assignedToInitialLabel,
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
    } satisfies TicketFormOutput,
    mapToForm: (ticket) =>
      ({
        title: ticket.title,
        description: ticket.description,
        categoryId: Number(ticket.category?.id),
        assignedToId:
          ticket.assignedTo?.id != null ? Number(ticket.assignedTo.id) : undefined,
      }) satisfies TicketFormOutput,
    fields: ticketFields,
    createMutation: CREATE_TICKET,
    successMessage: "Ticket #{id} creato con successo.",
    listQuery: GET_TICKETS,
    listVariables: { ...listVariables, after: null },
  };
}