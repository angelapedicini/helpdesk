"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, FormHelperText, TextField } from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { AppSelect } from "../inputs/select-input";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import {
  CategoryFormInput,
  CategoryFormOutput,
  CategoryFormSchema,
  UpdateCategoryFormInput,
  UpdateCategoryFormOutput,
  UpdateCategoryFormSchema,
} from "@/lib/validators/category.schema";
import { Department } from "@/lib/validators/enums.schema";
import { TicketSpecificField } from "@/graphql-generated/graphql";
import {
  CREATE_TICKET_CATEGORY,
  UPDATE_TICKET_CATEGORY,
} from "@/apollo-client/queries/ticket-category/ticket-category.mutations";

const SPECIFIC_FIELD_OPTIONS: { id: TicketSpecificField; label: string }[] = [
  { id: "HARDWARE_TYPE", label: "Tipo hardware" },
  { id: "SOFTWARE", label: "Software" },
  { id: "PAYROLL_REFERENCE", label: "Riferimento busta paga" },
  { id: "EMPLOYEE_REFERENCE", label: "Riferimento dipendente" },
  { id: "CUSTOMER", label: "Cliente" },
  { id: "INVOICE_REFERENCE", label: "Riferimento fattura" },
  { id: "BUDGET_TYPE", label: "Tipo di budget" },
  { id: "SHIPMENT_REFERENCE", label: "Riferimento spedizione" },
];

const DEPARTMENT_OPTIONS = (Object.keys(DEPARTMENT_CONFIG) as Department[]).map(
  (id) => ({
    id,
    label: DEPARTMENT_CONFIG[id].label,
    icon: DEPARTMENT_CONFIG[id].icon,
    color: DEPARTMENT_CONFIG[id].color,
  })
);

type CategoryFormProps = {
  category?: { id: number; name: string; specificField: TicketSpecificField | null } | null;
  defaultDepartment?: Department;
  onSubmit: () => void;
};

export default function CategoryForm({
  category,
  defaultDepartment,
  onSubmit,
}: CategoryFormProps) {
  const isEdit = !!category;

  const createForm = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      department: defaultDepartment,
      specificField: category?.specificField ?? undefined,
    },
  });

  const updateForm = useForm<UpdateCategoryFormInput, unknown, UpdateCategoryFormOutput>({
    resolver: zodResolver(UpdateCategoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      specificField: category?.specificField ?? undefined,
    },
  });

  const {
    control: createControl,
    register: createRegister,
    handleSubmit: createHandleSubmit,
    formState: createState,
  } = createForm;

  const {
    control: updateControl,
    register: updateRegister,
    handleSubmit: updateHandleSubmit,
    formState: updateState,
  } = updateForm;

  const [createTicketCategory] = useMutation(CREATE_TICKET_CATEGORY, {
    context: { successMessage: "Categoria creata con successo." },
    refetchQueries: ["Categories"],
    awaitRefetchQueries: true,
  });

  const [updateTicketCategory] = useMutation(UPDATE_TICKET_CATEGORY, {
    context: { successMessage: "Categoria aggiornata con successo." },
    refetchQueries: ["Categories", "CategoryAccesses"],
    awaitRefetchQueries: true,
  });

  if (isEdit) {
    const { errors, isSubmitting } = updateState;
    const register = updateRegister;

    const handleEditSubmit = async (values: UpdateCategoryFormOutput) => {
      const result = await updateTicketCategory({
        variables: {
          id: category!.id,
          input: { name: values.name, specificField: values.specificField },
        },
      });

      if (result.error) return;
      onSubmit();
    };

    return (
      <Box
        component="form"
        onSubmit={updateHandleSubmit(handleEditSubmit)}
        noValidate
        sx={{ width: "100%", boxSizing: "border-box" }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mt: 2 }}>
          <TextField
            label="Nome"
            fullWidth
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <AppSelect
            name="specificField"
            label="Campo specifico"
            control={updateControl}
            options={SPECIFIC_FIELD_OPTIONS}
          />

          <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ gridColumn: { md: "1 / -1" } }}>
            Salva
          </Button>
        </Box>
      </Box>
    );
  }

  const { errors, isSubmitting } = createState;
  const register = createRegister;

  const handleCreateSubmit = async (values: CategoryFormOutput) => {
    const result = await createTicketCategory({
      variables: {
        input: {
          name: values.name,
          department: values.department,
          specificField: values.specificField,
        },
      },
    });

    if (result.error) return;
    onSubmit();
  };

  return (
    <Box
      component="form"
      onSubmit={createHandleSubmit(handleCreateSubmit)}
      noValidate
      sx={{ width: "100%", boxSizing: "border-box" }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mt: 2 }}>
        <TextField
          label="Nome"
          fullWidth
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <AppSelect
          name="department"
          label="Dipartimento"
          control={createControl}
          options={DEPARTMENT_OPTIONS}
        />

        <AppSelect
          name="specificField"
          label="Campo specifico"
          control={createControl}
          options={SPECIFIC_FIELD_OPTIONS}
        />

        {errors.department && (
          <FormHelperText error>{errors.department.message}</FormHelperText>
        )}

        <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ gridColumn: { md: "1 / -1" } }}>
          Crea categoria
        </Button>
      </Box>
    </Box>
  );
}