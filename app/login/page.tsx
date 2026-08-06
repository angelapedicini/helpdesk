"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { LoginInput, LoginSchema } from "@/lib/validators/auth.schema";
import { useAppMutation } from "@/apollo-client/hooks/mutation-hook";
import { LOGIN } from "@/apollo-client/queries/auth/login/login.mutation";




export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  const { mutate: login, loading } = useAppMutation(
    LOGIN,
    "Login avvenuto con successo."
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginInput) => {
    const result = await login({ input: data });
    if (result.data && !result.error) {
      router.replace("/dashboard");
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
        {/* fontWeight e letterSpacing vengono dal tema */}
        <Typography variant="h4">Accedi</Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}
        >
          {/* fullWidth non serve più, viene dal tema */}
          <TextField
            label="Email"
            type="email"
            placeholder="mario@example.com"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password")}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* variant="contained" viene dal tema, size="large" è specifico di questa pagina */}
          <Button type="submit" size="large" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? "Accesso..." : "Accedi"}
          </Button>
        </Box>

        {/* fontSize e color vengono dal tema per body2 */}
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mt: 3 }}
        >
          Non hai un account?{" "}
          <Link href="/register" style={{ color: "inherit", fontWeight: 600 }}>
            Registrati
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}