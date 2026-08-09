"use client";

import { z } from "zod";
import { CREATE_TICKET, UPDATE_TICKET } from "@/apollo-client/queries/ticket/ticket.mutation";
import { GET_TICKETS, Ticket } from "@/apollo-client/queries/ticket/ticket.queries";
import { EntityFormConfig, FieldDef } from "@/components/form-engine/fieldDefs";
import { useAppLazyQuery } from "@/apollo-client/hooks/lazy-query";
import { useAppQuery } from "@/apollo-client/hooks/query-hook";
import { SEARCH_USERS } from "@/apollo-client/queries/user/search";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { TicketCreateSchema } from "@/lib/validators/ticket.schema";
import { TicketsQueryVariables } from "@/apollo-client/gql/graphql";
import { Department } from "@/lib/validators/auth.schema";

type TicketFormOutput = z.output<typeof TicketCreateSchema>;

export function useTicketFormConfig(
  listVariables: TicketsQueryVariables,
  initialData?: Ticket,
  presetDepartment?: Department,
): EntityFormConfig<TicketFormOutput, Ticket> {
  const department =
    initialData?.ticketDepartment ?? presetDepartment;

  console.log("FORM CONFIG", {
    presetDepartment,
    initialDepartment: initialData?.ticketDepartment,
    department,
  });

  const { data: categories } = useAppQuery(GET_CATEGORIES, {
    variables: { department },
    skip: !department,
  });

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
    // {
    //   name: "assignedToId",
    //   label: "Assegnatario (opzionale)",
    //   type: "search",
    //   initialLabel: assignedToInitialLabel,
    //   searchFn: async (filter) => {
    //     const users = await runSearchUsers({ search: filter.search } as never);
    //     return (users ?? []).map((u) => ({
    //       id: u.id,
    //       label: `${u.firstName} ${u.lastName}`,
    //     }));
    //   },
    // },
  ];

  return {
    schema: TicketCreateSchema,
    defaultValues: {
      title: "",
      description: "",
      categoryId: undefined as unknown as number,
      department: department ?? (undefined as unknown as Department),
    } satisfies TicketFormOutput,
    mapToForm: (ticket) =>
      ({
        title: ticket.title,
        description: ticket.description,
        categoryId: Number(ticket.category?.id),
        department: ticket.ticketDepartment,
      }) satisfies TicketFormOutput,
    fields: ticketFields,
    createMutation: CREATE_TICKET,
    updateMutation: UPDATE_TICKET,
    successMessage: "Ticket #{id} creato con successo.",
    updateSuccessMessage: "Ticket #{id} aggiornato con successo.",
    listQuery: GET_TICKETS,
    listVariables: { ...listVariables, after: null },
  };
}