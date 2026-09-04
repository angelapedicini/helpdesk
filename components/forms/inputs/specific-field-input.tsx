// components/ticket/specific-field-input.tsx
"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Box, MenuItem, TextField } from "@mui/material";
import { TicketSpecificField } from "@/apollo-client/gql/graphql";

import { HARDWARE_TYPE_CONFIG } from "@/components/enums/hardware-type.config";
import { SOFTWARE_CONFIG } from "@/components/enums/software.config";
import { CUSTOMER_CONFIG } from "@/components/enums/customer.config";
import { BUDGET_TYPE_CONFIG } from "@/components/enums/budget-type.config";

const FIELD_UI_CONFIG: Record<
    TicketSpecificField,
    | { label: string; kind: "text" }
    | {
          label: string;
          kind: "enum";
          config: Record<string, { label: string; icon: React.ComponentType<{ sx?: object }>; color: string }>;
      }
> = {
    HARDWARE_TYPE: { label: "Tipo hardware", kind: "enum", config: HARDWARE_TYPE_CONFIG },
    SOFTWARE: { label: "Software", kind: "enum", config: SOFTWARE_CONFIG },
    PAYROLL_REFERENCE: { label: "Riferimento busta paga", kind: "text" },
    EMPLOYEE_REFERENCE: { label: "Riferimento dipendente", kind: "text" },
    CUSTOMER: { label: "Cliente", kind: "enum", config: CUSTOMER_CONFIG },
    INVOICE_REFERENCE: { label: "Riferimento fattura", kind: "text" },
    BUDGET_TYPE: { label: "Tipo di budget", kind: "enum", config: BUDGET_TYPE_CONFIG },
    SHIPMENT_REFERENCE: { label: "Riferimento spedizione", kind: "text" },
};

// T = shape del form ospite (CreateTicketFormValues, UpdateTicketInput, ecc.)
// Basta che T abbia un campo "specificValue?: string"
type SpecificFieldInputProps<T extends FieldValues & { specificValue?: string }> = {
    specificField: TicketSpecificField | null | undefined;
    control: Control<T>;
    error?: string;
};

export function SpecificFieldInput<T extends FieldValues & { specificValue?: string }>({
    specificField,
    control,
    error,
}: SpecificFieldInputProps<T>) {
    if (!specificField) return null;

    const fieldConfig = FIELD_UI_CONFIG[specificField];
    const name = "specificValue" as Path<T>;

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) =>
                fieldConfig.kind === "enum" ? (
                    <TextField
                        {...field}
                        value={field.value ?? ""}
                        select
                        label={`Specifica - ${fieldConfig.label}`}
                        fullWidth
                        error={!!error}
                        helperText={error}
                        slotProps={{
                            select: {
                                MenuProps: {
                                    slotProps: {
                                        paper: { sx: { maxHeight: 300 } },
                                    },
                                },
                            },
                        }}
                    >
                        {Object.entries(fieldConfig.config).map(([value, { label, icon: Icon, color }]) => (
                            <MenuItem key={value} value={value}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Icon sx={{ color, fontSize: 20 }} />
                                    {label}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>
                ) : (
                    <TextField
                        {...field}
                        label={`Specifica - ${fieldConfig.label}`}
                        fullWidth
                        error={!!error}
                        helperText={error}
                    />
                )
            }
        />
    );
}