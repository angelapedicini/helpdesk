"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField, FormHelperText } from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { AppSelect } from "../inputs/select-input";
import { ROLE_CONFIG } from "@/components/enums/role.config";
import {
  UpdateUserRoleFormInput,
  UpdateUserRoleFormOutput,
  UpdateUserRoleFormSchema,
} from "@/lib/validators/user.schema";
import { Role } from "@/lib/validators/enums.schema";
import { UPDATE_USER_ROLE } from "@/apollo-client/queries/user/userRole.mutation";
import FormLayout from "../form-layout";

const readOnlyFieldSx = {
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "var(--mui-palette-primary-main)",
    color: "primary.main",
  },
};

const ASSIGNABLE_ROLES: Role[] = ["EMPLOYEE", "TECHNICIAN", "ADMIN"];

type UpdateUserRoleFormProps = {
  userId: number;
  fullName: string;
  currentRole: Role;
  onSubmit: () => void;
};

export default function UpdateUserRoleForm({
  userId,
  fullName,
  currentRole,
  onSubmit,
}: UpdateUserRoleFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserRoleFormInput, unknown, UpdateUserRoleFormOutput>({
    resolver: zodResolver(UpdateUserRoleFormSchema),
    defaultValues: { role: currentRole },
  });

  const [updateUserRole] = useMutation(UPDATE_USER_ROLE, {
    context: {
      successMessage: "Ruolo aggiornato con successo.",
    },
    refetchQueries: ["UsersManagement"],
    awaitRefetchQueries: true,
  });

  const roleOptions = ASSIGNABLE_ROLES.map((id) => ({
    id,
    label: ROLE_CONFIG[id].label,
    icon: ROLE_CONFIG[id].icon,
    color: ROLE_CONFIG[id].color,
    disabled: id === currentRole,
  }));

  const handleFormSubmit = async (values: UpdateUserRoleFormOutput) => {
    if (values.role === currentRole) return;

    const result = await updateUserRole({
      variables: {
        input: { userId, role: values.role },
      },
    });

    if (result.error) {
      return;
    }

    onSubmit();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{ width: "100%", boxSizing: "border-box" }}
    >
      <FormLayout
        actions={
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Salva
          </Button>
        }
      >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mt: 2,
        }}
      >
        <TextField
          label="Utente"
          value={fullName}
          disabled
          fullWidth
          sx={readOnlyFieldSx}
        />

        <AppSelect
          name="role"
          label="Nuovo ruolo"
          control={control}
          options={roleOptions}
        />

        {errors.role && (
          <FormHelperText error sx={{ gridColumn: { md: "1 / -1" } }}>
            {errors.role.message}
          </FormHelperText>
        )}
        </Box>
      </FormLayout>
    </Box>
  );
}