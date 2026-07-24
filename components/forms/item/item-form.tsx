"use client";

import { z } from "zod";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, MenuItem, Stack, TextField } from "@mui/material";
import { ItemInputSchema } from "@/lib/validators/item.schema";
import { useAppMutation } from "@/lib/apollo-client/hooks/mutation-hook";
import { CREATE_ITEM, UPDATE_ITEM } from "@/lib/apollo-client/queries/item/item.mutations";
import { GET_ITEMS } from "@/lib/apollo-client/queries/item/item.queries";
import type { ItemsQuery } from "@/lib/gql/graphql";

type ItemFormInput = z.input<typeof ItemInputSchema>;
type ItemFormOutput = z.output<typeof ItemInputSchema>;

type Item = ItemsQuery["items"][number];

interface ItemFormProps {
    item?: Item;
    onSuccess?: () => void;
}

export function ItemForm({ item, onSuccess }: ItemFormProps) {
    const isEditMode = !!item;

    const { mutate: createItem, loading: creating } = useAppMutation(
        CREATE_ITEM,
        "Elemento creato con successo.",
        GET_ITEMS,
        "prepend"
    );

    const { mutate: updateItem, loading: updating } = useAppMutation(
        UPDATE_ITEM,
        "Elemento aggiornato con successo.",
        GET_ITEMS,
        "replace"
    );

    const loading = creating || updating;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ItemFormInput, unknown, ItemFormOutput>({
        resolver: zodResolver(ItemInputSchema),
        defaultValues: item
            ? {
                  string: item.string,
                  optionalEasy: item.optionalEasy ?? undefined,
                  numberDecimal: item.numberDecimal,
                  data: new Date(item.data).toISOString().slice(0, 10),
                  dataOptional: item.dataOptional
                      ? new Date(item.dataOptional).toISOString().slice(0, 10)
                      : undefined,
                  enum: item.enum,
                  userId: item.user.id,
              }
            : undefined,
    });

    const onSubmit: SubmitHandler<ItemFormOutput> = async (values) => {
        if (isEditMode) {
            const input = {
                ...values,
                data: values.data.toISOString(),
                dataOptional: values.dataOptional ? values.dataOptional.toISOString() : null,
            };

            const result = await updateItem({ id: item!.id, input });

            if (result.data && !result.error) {
                onSuccess?.();
            }
            return;
        }

        const input = {
            ...values,
            enum: values.enum ?? "ATTESA",
            data: values.data.toISOString(),
            dataOptional: values.dataOptional ? values.dataOptional.toISOString() : null,
        };

        const result = await createItem({ input });

        if (result.data && !result.error) {
            onSuccess?.();
        }
    };

    return (
        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
            <TextField
                label="Testo"
                {...register("string")}
                error={!!errors.string}
                helperText={errors.string?.message}
            />

            <TextField
                label="Testo opzionale"
                {...register("optionalEasy")}
                error={!!errors.optionalEasy}
                helperText={errors.optionalEasy?.message}
            />

            <TextField
                label="Numero"
                type="number"
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("numberDecimal", { valueAsNumber: true })}
                error={!!errors.numberDecimal}
                helperText={errors.numberDecimal?.message}
            />

            <TextField
                label="Data"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("data")}
                error={!!errors.data}
                helperText={errors.data?.message}
            />

            <Controller
                name="enum"
                control={control}
                defaultValue={item?.enum ?? "ATTESA"}
                render={({ field }) => (
                    <TextField
                        select
                        label="Stato"
                        {...field}
                        error={!!errors.enum}
                        helperText={errors.enum?.message}
                    >
                        <MenuItem value="ACCETTATO">Accettato</MenuItem>
                        <MenuItem value="RIFIUTATO">Rifiutato</MenuItem>
                        <MenuItem value="ATTESA">Attesa</MenuItem>
                    </TextField>
                )}
            />

            <TextField
                label="ID Utente"
                type="number"
                {...register("userId")}
                error={!!errors.userId}
                helperText={errors.userId?.message}
            />

            <Button type="submit" variant="contained" disabled={loading}>
                {isEditMode ? "Salva" : "Crea"}
            </Button>
        </Stack>
    );
}