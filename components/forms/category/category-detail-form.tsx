"use client";

import { Fragment, useEffect, useMemo, type ComponentType } from "react";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import {
    Box,
    Button,
    TextField,
    Typography,
    type SvgIconProps,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";

import { AppSelect, type SelectOption } from "../inputs/select-input";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { ROLE_CONFIG } from "@/components/enums/role.config";
import {
    SPECIFIC_FIELD_LABELS,
    getSpecificFieldsForDepartment,
} from "@/lib/config/ticket-specific-field.config";
import { UPDATE_CATEGORY } from "@/apollo-client/queries/ticket-category/ticket-category.mutations";
import {
    CategoryDetailFormInput,
    CategoryDetailFormOutput,
    CategoryDetailFormSchema,
} from "@/lib/validators/category.schema";
import type { Department, Role, TicketSpecificField } from "@/lib/validators/enums.schema";

type AccessRow = {
    key: Department | "ALL";
    label: string;
    icon?: ComponentType<SvgIconProps>;
    color?: string;
};

const ACCESS_ROWS: AccessRow[] = [
    ...(Object.keys(DEPARTMENT_CONFIG) as Department[]).map((dept) => ({
        key: dept,
        label: DEPARTMENT_CONFIG[dept].label,
        icon: DEPARTMENT_CONFIG[dept].icon,
        color: DEPARTMENT_CONFIG[dept].color,
    })),
    {
        key: "ALL",
        label: "Tutti i reparti",
        icon: PublicIcon,
        color: "grey.600",
    },
];

type CategoryDetailFormProps = {
    category: {
        id: number;
        name: string;
        department: Department;
        specificField: TicketSpecificField | null;
        disabled: boolean | null;
    };
    accesses: Array<{
        requesterDepartment: Department | null;
        requesterMinRole: Role;
        disabled: boolean | null;
    }>;
};

export default function CategoryDetailForm({
    category,
    accesses,
}: CategoryDetailFormProps) {
    const defaultValues = useMemo((): CategoryDetailFormInput => {
        const access: CategoryDetailFormInput["access"] = {
            FINANCE: "",
            HR: "",
            IT: "",
            LOGISTIC: "",
            SUPPORT: "",
            ALL: "",
        };

        for (const grant of accesses) {
            if (grant.disabled) continue;
            access[grant.requesterDepartment ?? "ALL"] = grant.requesterMinRole;
        }

        return {
            name: category.name,
            specificField:
                category.specificField ??
                getSpecificFieldsForDepartment(category.department)[0],
            access,
        };
    }, [category, accesses]);

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<CategoryDetailFormInput, undefined, CategoryDetailFormOutput>({
        resolver: zodResolver(CategoryDetailFormSchema),
        defaultValues,
        mode: "onChange",
    });

    const selectedAll = useWatch({ control, name: "access.ALL" });
    const allAccessSelected = selectedAll !== "";

    // "Tutti i reparti" e le righe specifiche sono mutuamente esclusivi
    // (il backend scarta i grant specifici quando c'è il wildcard): azzera
    // i select dei reparti e li disabilita così l'utente non salva valori
    // che verrebbero buttati via.
    useEffect(() => {
        if (!allAccessSelected) return;
        for (const row of ACCESS_ROWS) {
            if (row.key === "ALL") continue;
            setValue(`access.${row.key}`, "", { shouldDirty: true });
        }
    }, [allAccessSelected, setValue]);

    const [updateCategory] = useMutation(UPDATE_CATEGORY, {
        context: { successMessage: "Categoria aggiornata con successo." },
        refetchQueries: ["CategoryById", "CategoryAccesses"],
        awaitRefetchQueries: true,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const specificFieldOptions = useMemo(() => {
        const allowed = getSpecificFieldsForDepartment(category.department);
        const options: SelectOption<TicketSpecificField>[] = allowed.map((sf) => ({
            id: sf,
            label: SPECIFIC_FIELD_LABELS[sf],
        }));

        if (category.specificField && !allowed.includes(category.specificField)) {
            options.unshift({
                id: category.specificField,
                label: SPECIFIC_FIELD_LABELS[category.specificField],
            });
        }

        return options;
    }, [category.department, category.specificField]);

    const minRoleOptions = useMemo(() => {
        const base: SelectOption<Role | "">[] = [
            { id: "", label: "Nessun accesso" },
            {
                id: "ADMIN",
                label: ROLE_CONFIG.ADMIN.label,
                icon: ROLE_CONFIG.ADMIN.icon,
                color: ROLE_CONFIG.ADMIN.color,
            },
            {
                id: "TECHNICIAN",
                label: ROLE_CONFIG.TECHNICIAN.label,
                icon: ROLE_CONFIG.TECHNICIAN.icon,
                color: ROLE_CONFIG.TECHNICIAN.color,
            },
            {
                id: "EMPLOYEE",
                label: ROLE_CONFIG.EMPLOYEE.label,
                icon: ROLE_CONFIG.EMPLOYEE.icon,
                color: ROLE_CONFIG.EMPLOYEE.color,
            },
        ];

        // Se esistono grant salvati con ruoli non tra le opzioni di base
        // (es. SYSTEM_ADMIN da dati storici), li aggiungiamo per non farli
        // comparire come "vuoti" né perderli al salvataggio (full-replace).
        const storedRoles = new Set(
            accesses.filter((a) => !a.disabled).map((a) => a.requesterMinRole)
        );
        for (const role of storedRoles) {
            if (!base.some((o) => o.id === role)) {
                base.push({
                    id: role,
                    label: ROLE_CONFIG[role].label,
                    icon: ROLE_CONFIG[role].icon,
                    color: ROLE_CONFIG[role].color,
                });
            }
        }

        return base;
    }, [accesses]);

    const handleFormSubmit = async (values: CategoryDetailFormOutput) => {
        const accessGrants = ACCESS_ROWS.flatMap((row) => {
            const minRole = values.access[row.key];
            if (!minRole) return [];
            return [
                {
                    requesterDepartment:
                        row.key === "ALL" ? null : row.key,
                    requesterMinRole: minRole,
                },
            ];
        });

        const result = await updateCategory({
            variables: {
                id: category.id,
                input: {
                    name: values.name,
                    specificField: values.specificField,
                    accessGrants,
                },
            },
        });

        if (result.error) return;
    };

    const handleReset = () => {
        reset(defaultValues);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            sx={{
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                    },
                    gap: 3,
                }}
            >
                <TextField
                    {...register("name")}
                    label="Nome"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />

                <AppSelect
                    name="specificField"
                    label="Campo specifico"
                    control={control}
                    options={specificFieldOptions}
                />

                <TextField
                    label="Dipartimento"
                    value={
                        DEPARTMENT_CONFIG[category.department]?.label ??
                        category.department
                    }
                    fullWidth
                    disabled
                />

                <TextField
                    label="Stato"
                    value={category.disabled ? "Disabilitata" : "Attiva"}
                    fullWidth
                    disabled
                />
            </Box>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Accessi per dipartimento
            </Typography>

            {allAccessSelected && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    “Tutti i reparti” ha la precedenza sugli accessi specifici,
                    che verranno scartati al salvataggio.
                </Typography>
            )}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "200px 1fr",
                    },
                    gap: 3,
                    alignItems: "center",
                }}
            >
                {ACCESS_ROWS.map((row) => {
                    const RowIcon = row.icon;
                    return (
                        <Fragment key={row.key}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                {RowIcon && (
                                    <RowIcon
                                        sx={{
                                            color:
                                                row.color ?? "text.secondary",
                                            fontSize: 20,
                                        }}
                                    />
                                )}
                                <Typography>{row.label}</Typography>
                            </Box>

                            <AppSelect
                                name={`access.${row.key}`}
                                label="Ruolo minimo"
                                control={control}
                                options={minRoleOptions}
                                disabled={allAccessSelected && row.key !== "ALL"}
                            />
                        </Fragment>
                    );
                })}
            </Box>

            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                    mt: 3,
                }}
            >
                <Button
                    type="button"
                    variant="outlined"
                    disabled={isSubmitting || !isDirty}
                    onClick={handleReset}
                >
                    Ripristina
                </Button>

                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    Salva
                </Button>
            </Box>
        </Box>
    );
}