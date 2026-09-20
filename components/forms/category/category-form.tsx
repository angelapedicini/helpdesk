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
  UpdateCategoryFormInput,
  UpdateCategoryFormOutput,
  UpdateCategoryFormSchema,
} from "@/lib/validators/category.schema";
import { Department } from "@/lib/validators/enums.schema";
import { TicketSpecificField } from "@/graphql-generated/graphql";
import {
  SPECIFIC_FIELD_LABELS,
  SPECIFIC_FIELDS_BY_DEPARTMENT,
} from "@/lib/config/ticket-specific-field.config";
import {
  CREATE_TICKET_CATEGORY,
  UPDATE_TICKET_CATEGORY,
} from "@/apollo-client/queries/ticket-category/ticket-category.mutations";

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
  category?: {
    id: number;
    name: string;
    specificField: TicketSpecificField | null;
    department?: Department;
  } | null;
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

const selectedDepartment = useWatch({ control: createControl, name: "department" });
  const selectedSpecificField = useWatch({ control: createControl, name: "specificField" });
  const updateSpecificField = useWatch({ control: updateControl, name: "specificField" });

  useEffect(() => {
    if (!selectedDepartment || !selectedSpecificField) return;
    const allowed = SPECIFIC_FIELDS_BY_DEPARTMENT[selectedDepartment] ?? [];
    if (!allowed.includes(selectedSpecificField)) {
      createForm.unregister("specificField");
    }
  }, [selectedDepartment, selectedSpecificField, createForm]);

  useEffect(() => {
    if (!isEdit || !category?.department || !updateSpecificField) return;
    const allowed = SPECIFIC_FIELDS_BY_DEPARTMENT[category.department] ?? [];
    if (!allowed.includes(updateSpecificField)) {
      updateForm.unregister("specificField");
    }
  }, [isEdit, category?.department, updateSpecificField, updateForm]);

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

    const categoryDepartment = category?.department;

    const updateSpecificFieldOptions = categoryDepartment
      ? SPECIFIC_FIELD_OPTIONS.filter((option) =>
          SPECIFIC_FIELDS_BY_DEPARTMENT[categoryDepartment]?.includes(option.id)
        )
      : SPECIFIC_FIELD_OPTIONS;

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
            options={updateSpecificFieldOptions}
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
          options={filteredSpecificFieldOptions}
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