"use client";

import { useEffect } from "react";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, FormHelperText, TextField } from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { AppSelect } from "../inputs/select-input";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import {
  CategoryFormInput,
  CategoryFormOutput,
  CategoryFormSchema,
} from "@/lib/validators/category.schema";
import { Department } from "@/lib/validators/enums.schema";
import { TicketSpecificField } from "@/graphql-generated/graphql";
import {
  SPECIFIC_FIELD_LABELS,
  SPECIFIC_FIELDS_BY_DEPARTMENT,
} from "@/lib/config/ticket-specific-field.config";
import { CREATE_TICKET_CATEGORY } from "@/apollo-client/queries/ticket-category/ticket-category.mutations";
import { useCategoryCreateFieldPermissions } from "@/lib/casl/abilities/category/hook-permission";
import FormLayout from "../form-layout";

const SPECIFIC_FIELD_OPTIONS: { id: TicketSpecificField; label: string }[] = (
  Object.keys(SPECIFIC_FIELD_LABELS) as TicketSpecificField[]
).map((id) => ({
  id,
  label: SPECIFIC_FIELD_LABELS[id],
}));

const DEPARTMENT_OPTIONS = (Object.keys(DEPARTMENT_CONFIG) as Department[]).map(
  (id) => ({
    id,
    label: DEPARTMENT_CONFIG[id].label,
    icon: DEPARTMENT_CONFIG[id].icon,
    color: DEPARTMENT_CONFIG[id].color,
  })
);

type CategoryFormProps = {
  defaultDepartment?: Department;
  onSubmit: () => void;
};

export default function CategoryForm({
  defaultDepartment,
  onSubmit,
}: CategoryFormProps) {
  const form = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: "",
      department: defaultDepartment,
      specificField: undefined,
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const selectedDepartment = useWatch({ control, name: "department" });
  const selectedSpecificField = useWatch({ control, name: "specificField" });

  const { department: departmentEditable } = useCategoryCreateFieldPermissions();

  useEffect(() => {
    if (!selectedDepartment || !selectedSpecificField) return;
    const allowed = SPECIFIC_FIELDS_BY_DEPARTMENT[selectedDepartment] ?? [];
    if (!allowed.includes(selectedSpecificField)) {
      form.unregister("specificField");
    }
  }, [selectedDepartment, selectedSpecificField, form]);

  const [createTicketCategory] = useMutation(CREATE_TICKET_CATEGORY, {
    context: { successMessage: "Categoria creata con successo." },
    refetchQueries: ["Categories"],
    awaitRefetchQueries: true,
  });

  const filteredSpecificFieldOptions = selectedDepartment
    ? SPECIFIC_FIELD_OPTIONS.filter((option) =>
        SPECIFIC_FIELDS_BY_DEPARTMENT[selectedDepartment]?.includes(option.id)
      )
    : SPECIFIC_FIELD_OPTIONS;

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
      onSubmit={handleSubmit(handleCreateSubmit)}
      noValidate
      sx={{ width: "100%", boxSizing: "border-box" }}
    >
      <FormLayout
        actions={
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Crea categoria
          </Button>
        }
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
          control={control}
          options={DEPARTMENT_OPTIONS}
          disabled={!departmentEditable}
        />

        <AppSelect
          name="specificField"
          label="Campo specifico"
          control={control}
          options={filteredSpecificFieldOptions}
        />

        {errors.department && (
          <FormHelperText error>{errors.department.message}</FormHelperText>
        )}
        </Box>
      </FormLayout>
    </Box>
  );
}