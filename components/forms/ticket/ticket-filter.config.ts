"use client";

import { SEARCH_USERS } from "@/lib/apollo-client/queries/user/search";
import { TicketFilterSchema, TicketFilterOutput } from "@/lib/validators/ticket.schema";
import { FilterFormConfig, FieldDef } from "@/components/form-engine/fieldDefs";
import { useAppLazyQuery } from "@/lib/apollo-client/hooks/lazy-query";
import { useAppQuery } from "@/lib/apollo-client/hooks/query-hook";
import { GET_CATEGORIES } from "@/lib/apollo-client/queries/ticket-category/ticket-category.queries";

const emptyValues: TicketFilterOutput = {
  createdById: undefined,
  assignedToId: undefined,
  status: undefined,
  categoryId: undefined,
};

export function useTicketFilterFormConfig(): FilterFormConfig<TicketFilterOutput> {
  const { run: runSearchUsers } = useAppLazyQuery(SEARCH_USERS);
  const { data: categories } = useAppQuery(GET_CATEGORIES);

  const categoryOptions = (categories ?? []).map((c) => ({
    id: c.id,
    label: c.name,
  }));

  const searchUsers = async (filter: { search?: string }) => {
    const users = await runSearchUsers({ search: filter.search } as never);
    return (users ?? []).map((u) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName}`,
    }));
  };

  const fields: FieldDef[] = [
    {
      name: "createdById",
      label: "Creatore",
      type: "search",
      searchFn: searchUsers,
    },
    {
      name: "assignedToId",
      label: "Tecnico assegnato",
      type: "search",
      searchFn: searchUsers,
    },
    {
      name: "status",
      label: "Stato",
      type: "select",
      options: [
        { id: "OPEN", label: "Aperto" },
        { id: "IN_PROGRESS", label: "In lavorazione" },
        { id: "CLOSED", label: "Chiuso" },
      ],
    },
    {
      name: "categoryId",
      label: "Categoria",
      type: "select",
      options: categoryOptions,
    },
  ];

  return {
    schema: TicketFilterSchema,
    defaultValues: emptyValues,
    fields,
  };
}