"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, FormHelperText, TextField } from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { AppSelect } from "../inputs/select-input";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { ROLE_CONFIG } from "@/components/enums/role.config";
import {
  CategoryAccessFormInput,
  CategoryAccessFormOutput,
  CategoryAccessFormSchema,
} from "@/lib/validators/category.schema";
import { Department, Role } from "@/lib/validators/enums.schema";
import { CREATE_TICKET_CATEGORY_ACCESS } from "@/apollo-client/queries/ticket-category/ticket-category.mutations";

const DEPARTMENT_OPTIONS = (Object.keys(DEPARTMENT_CONFIG) as Department[]).map(
  (id) => ({
    id,
    label: DEPARTMENT_CONFIG[id].label,
    icon: DEPARTMENT_CONFIG[id].icon,
    color: DEPARTMENT_CONFIG[id].color,
  })
);

const MIN_ROLE_OPTIONS: { id: Role; label: string; color: string }[] = [
  { id: "ADMIN", label: ROLE_CONFIG.ADMIN.label, color: ROLE_CONFIG.ADMIN.color },
  {
    id: "TECHNICIAN",
    label: ROLE_CONFIG.TECHNICIAN.label,
    color: ROLE_CONFIG.TECHNICIAN.color,
  },
  {
    id: "EMPLOYEE",
    label: ROLE_CONFIG.EMPLOYEE.label,
    color: ROLE_CONFIG.EMPLOYEE.color,
  },
];

const readOnlyFieldSx = {
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "var(--mui-palette-primary-main)",
    color: "primary.main",
  },
};

type CategoryAccessFormProps = {
  categoryId: number;
  categoryName: string;
  onSubmit: () => void;
};

export default function CategoryAccessForm({
  categoryId,
  categoryName,
  onSubmit,
}: CategoryAccessFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryAccessFormInput, unknown, CategoryAccessFormOutput>({
    resolver: zodResolver(CategoryAccessFormSchema),
    defaultValues: {
      requesterDepartment: null,
      requesterMinRole: "EMPLOYEE",
    },
  });

  const [createTicketCategoryAccess] = useMutation(CREATE_TICKET_CATEGORY_ACCESS, {
    context: {
      successMessage: "Accesso aggiunto con successo.",
    },
    refetchQueries: ["CategoryAccesses"],
    awaitRefetchQueries: true,
  });

  const handleFormSubmit = async (values: CategoryAccessFormOutput) => {
    const result = await createTicketCategoryAccess({
      variables: {
        input: {
          categoryId,
          requesterDepartment:
            values.requesterDepartment === "" ||
            values.requesterDepartment === null
              ? null
              : values.requesterDepartment,
          requesterMinRole: values.requesterMinRole,
        },
      },
    });

    if (result.error) return;
    onSubmit();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{ width: "100%", boxSizing: "border-box" }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mt: 2 }}>
        <TextField
          label="Categoria"
          value={categoryName}
          disabled
          fullWidth
          sx={readOnlyFieldSx}
        />

        <AppSelect
          name="requesterDepartment"
          label="Reparto richiedente"
          control={control}
          options={[
            { id: "" as const, label: "Tutti i reparti" },
            ...DEPARTMENT_OPTIONS,
          ]}
        />

        <AppSelect
          name="requesterMinRole"
          label="Ruolo minimo"
          control={control}
          options={MIN_ROLE_OPTIONS}
        />

        {errors.requesterDepartment && (
          <FormHelperText error>{errors.requesterDepartment.message}</FormHelperText>
        )}

        <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ gridColumn: { md: "1 / -1" } }}>
          Aggiungi accesso
        </Button>
      </Box>
    </Box>
  );
}