// components/forms/ticket/ticket-filter-form.tsx
"use client";

import { useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, MenuItem, Stack, TextField } from "@mui/material";
import {
  TicketFilterSchema,
  TicketFilterInput,
  TicketFilterOutput,
} from "@/lib/validators/ticket.schema";
import { useFilterPanel } from "@/components/filter-panel";

interface TicketFilterFormProps {
  onApply: (filter: TicketFilterOutput) => void;
  defaultValues?: TicketFilterInput;
}

const emptyValues: TicketFilterInput = {
  createdById: "",
  assignedToId: "",
  status: "",
  categoryId: "",
};

export function TicketFilterForm({ onApply, defaultValues }: TicketFilterFormProps) {
  const { onClose, setActiveFilterCount } = useFilterPanel();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TicketFilterInput, unknown, TicketFilterOutput>({
    resolver: zodResolver(TicketFilterSchema),
    defaultValues: defaultValues ?? emptyValues,
  });

  const onSubmit: SubmitHandler<TicketFilterOutput> = (values) => {
    const activeCount = Object.values(values).filter((v) => v !== undefined).length;
    setActiveFilterCount(activeCount);
    onApply(values);
    onClose();
  };

  const handleReset = () => {
    reset(emptyValues);
    setActiveFilterCount(0);
    onApply({} as TicketFilterOutput);
    onClose();
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      {/* TODO: sostituire con select popolata da query utenti (creatore) */}
      <TextField
        label="ID Creatore"
        type="number"
        {...register("createdById")}
        error={!!errors.createdById}
        helperText={errors.createdById?.message}
      />

      {/* TODO: sostituire con select popolata da query utenti (tecnico) */}
      <TextField
        label="ID Tecnico assegnato"
        type="number"
        {...register("assignedToId")}
        error={!!errors.assignedToId}
        helperText={errors.assignedToId?.message}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <TextField select label="Stato" {...field} error={!!errors.status} helperText={errors.status?.message}>
            <MenuItem value="">Tutti</MenuItem>
            <MenuItem value="OPEN">Aperto</MenuItem>
            <MenuItem value="IN_PROGRESS">In lavorazione</MenuItem>
            <MenuItem value="CLOSED">Chiuso</MenuItem>
          </TextField>
        )}
      />

      {/* TODO: sostituire con select popolata da query categorie */}
      <TextField
        label="ID Categoria"
        type="number"
        {...register("categoryId")}
        error={!!errors.categoryId}
        helperText={errors.categoryId?.message}
      />

      <Stack direction="row" spacing={1}>
        <Button type="submit" variant="contained" fullWidth>
          Applica
        </Button>
        <Button variant="text" onClick={handleReset} fullWidth>
          Reset
        </Button>
      </Stack>
    </Stack>
  );
}