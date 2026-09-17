// components/ticket/specific-field-input.tsx
"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { TextField } from "@mui/material";
import { TicketSpecificField } from "@/graphql-generated/graphql";

import { HARDWARE_TYPE_CONFIG } from "@/components/enums/hardware-type.config";
import { SOFTWARE_CONFIG } from "@/components/enums/software.config";
import { CUSTOMER_CONFIG } from "@/components/enums/customer.config";
import { BUDGET_TYPE_CONFIG } from "@/components/enums/budget-type.config";
import { AppSelect, type SelectOption } from "@/components/forms/inputs/select-input";

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

type SpecificFieldInputProps<T extends FieldValues & { specificValue?: string }> = {
    specificField: TicketSpecificField | null | undefined;
    control: Control<T>;
    error?: string;
    disabled?: boolean;
};

export function SpecificFieldInput<T extends FieldValues & { specificValue?: string }>({
    specificField,
    disabled,
    control,
    error,
}: SpecificFieldInputProps<T>) {
    if (!specificField) return null;

    const fieldConfig = FIELD_UI_CONFIG[specificField];
    const name = "specificValue" as Path<T>;

    if (fieldConfig.kind === "enum") {
        const options: SelectOption[] = Object.entries(fieldConfig.config).map(
            ([value, { label, icon, color }]) => ({
                id: value,
                label,
                icon,
                color,
            })
        );

        return (
            <AppSelect
                name={name}
                label={`Specifica - ${fieldConfig.label}`}
                control={control}
                options={options}
                disabled={disabled}
            />
        );
    }

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <TextField
                    {...field}
                    value={field.value ?? ""}
                    label={`Specifica - ${fieldConfig.label}`}
                    fullWidth
                    error={!!error}
                    helperText={error}
                    disabled={disabled}
                />
            )}
        />
    );
}