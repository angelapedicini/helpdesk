// components/ticket-form.tsx
"use client";

import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Stack, TextField } from "@mui/material";
import { TicketInputSchema } from "@/lib/validators/ticket.schema";
import { GET_TICKETS } from "@/lib/apollo-client/queries/ticket/ticket.queries";
import type { TicketsQueryVariables } from "@/lib/gql/graphql";
import { useAppMutation } from "@/lib/apollo-client/hooks/mutation-hook";
import { CREATE_TICKET } from "@/lib/apollo-client/queries/ticket/ticket.mutation";

type TicketFormInput = z.input<typeof TicketInputSchema>;
type TicketFormOutput = z.output<typeof TicketInputSchema>;

interface TicketFormProps {
  onSuccess?: () => void;
  // variabili correnti della lista (sort, page size) per rifare il fetch dal primo cursore
  listVariables: TicketsQueryVariables;
}

export function TicketForm({ onSuccess, listVariables }: TicketFormProps) {
  const { mutate: createTicket, loading } = useAppMutation(
    CREATE_TICKET,
    'Ticket #{id} creato con successo.', // o "Ticket #{id} creato con successo."
    GET_TICKETS,
    { ...listVariables, after: null }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketFormInput, unknown, TicketFormOutput>({
    resolver: zodResolver(TicketInputSchema),
  });

  const onSubmit: SubmitHandler<TicketFormOutput> = async (values) => {
    const result = await createTicket({ input: values });

    if (result.data && !result.error) {
      onSuccess?.();
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Titolo"
        {...register("title")}
        error={!!errors.title}
        helperText={errors.title?.message}
      />

      <TextField
        label="Descrizione"
        multiline
        minRows={3}
        {...register("description")}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      {/* TODO: sostituire con select popolata da query categorie */}
      <TextField
        label="ID Categoria"
        type="number"
        {...register("categoryId")}
        error={!!errors.categoryId}
        helperText={errors.categoryId?.message}
      />

      {/* TODO: sostituire con select popolata da query utenti */}
      <TextField
        label="ID Assegnatario (opzionale)"
        type="number"
        {...register("assignedToId")}
        error={!!errors.assignedToId}
        helperText={errors.assignedToId?.message}
      />

      <Button type="submit" variant="contained" disabled={loading}>
        Crea
      </Button>
    </Stack>
  );
}