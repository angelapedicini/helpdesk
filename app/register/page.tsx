// app/register/page.tsx
"use client";

import { z } from "zod";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  MenuItem,
} from "@mui/material";
import { RegisterSchema } from "@/lib/validators/auth.schema";
import { REGISTER } from "@/apollo-client/queries/auth/register/register.mutation";
import { useAppMutation } from "@/apollo-client/hooks/mutation-hook";

const DEPARTMENT_OPTIONS = [
  { value: "HR", label: "Risorse Umane" },
  { value: "IT", label: "IT" },
  { value: "FINANCE", label: "Finance" },
  { value: "SALES", label: "Sales" },
  { value: "MARKETING", label: "Marketing" },
] as const;

const RegisterFormSchema = RegisterSchema.extend({
  confirmPassword: z.string().min(8, "Deve contenere almeno 8 caratteri"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

type RegisterFormInput = z.input<typeof RegisterFormSchema>;
type RegisterFormOutput = z.output<typeof RegisterFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: createUser, loading } = useAppMutation(
    REGISTER,
    "Registrazione avvenuta con successo."
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormInput, unknown, RegisterFormOutput>({
    resolver: zodResolver(RegisterFormSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormOutput> = async (values) => {
    const { confirmPassword, ...payload } = values;

    const result = await createUser({ input: payload });

    if (result.data && !result.error) {
      router.replace("/");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 450 },
          p: { xs: 3, sm: 4 },
          borderRadius: { xs: 0, sm: 3 },
          minHeight: { xs: "100vh", sm: "auto" },
          display: { xs: "flex", sm: "block" },
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4">Crea account</Typography>

        <Stack
          component="form"
          spacing={2}
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 2 }}
        >
          <Stack direction="row" spacing={2}>
            <TextField
              label="Nome"
              placeholder="Mario"
              {...register("firstName")}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              label="Cognome"
              placeholder="Rossi"
              {...register("lastName")}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Stack>

          <TextField
            label="Email"
            type="email"
            placeholder="mario@example.com"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <Controller
            name="department"
            control={control}
            defaultValue={"" as RegisterFormInput["department"]}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Reparto"
                error={!!errors.department}
                helperText={errors.department?.message}
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="min. 8 caratteri"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Conferma password"
            type={showConfirm ? "text" : "password"}
            placeholder="ripeti la password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowConfirm((p) => !p)}
                    >
                      {showConfirm ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? "Registrazione..." : "Registrati"}
          </Button>
        </Stack>

        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mt: 3 }}
        >
          Hai già un account?{" "}
          <Link href="/" style={{ color: "inherit", fontWeight: 600 }}>
            Accedi
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}