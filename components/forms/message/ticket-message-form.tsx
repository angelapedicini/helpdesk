"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField } from "@mui/material";
import { useMutation } from "@apollo/client/react";

import { CREATE_TICKET_MESSAGE } from "@/apollo-client/queries/ticket-message/ticket-massage.mutations";
import { GET_MESSAGES } from "@/apollo-client/queries/ticket-message/ticket-message.queries";
import {
  TicketMessageFormInput,
  TicketMessageFormOutput,
  TicketMessageFormSchema,
} from "@/lib/validators/ticket-message.schema";

type TicketMessageFormProps = {
  ticketId: number;
  pageSize: number;
  onSent?: () => void;
};

export default function TicketMessageForm({
  ticketId,
  pageSize,
  onSent,
}: TicketMessageFormProps) {
  const form = useForm<TicketMessageFormInput, unknown, TicketMessageFormOutput>({
    resolver: zodResolver(TicketMessageFormSchema),
    defaultValues: { content: "" },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const [createMessage] = useMutation(CREATE_TICKET_MESSAGE, {
    refetchQueries: [
      {
        query: GET_MESSAGES,
        variables: { ticketId, first: pageSize, after: null },
      },
    ],
    awaitRefetchQueries: true,
  });

  const handleSend = async (values: TicketMessageFormOutput) => {
    const result = await createMessage({
      variables: { input: { ticketId, content: values.content } },
    });

    if (result.error) return;
    reset();
    onSent?.();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleSend)}
      noValidate
      sx={{ display: "flex", alignItems: "flex-start", gap: 1, width: "100%" }}
    >
      <TextField
        fullWidth
        multiline
        minRows={2}
        placeholder="Scrivi un messaggio..."
        {...register("content")}
        error={!!errors.content}
        helperText={errors.content?.message}
      />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        Invia
      </Button>
    </Box>
  );
}