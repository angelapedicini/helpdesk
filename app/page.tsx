"use client";

import { Box, Button } from "@mui/material";
import Link from "next/link";

export default function Page() {

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: 320,
        }}
      >
        <Button
          component={Link}
          href="/register"
          variant="outlined"
          size="large"
          sx={{ color: "inherit", py: 1.5, fontSize: "1.1rem" }}
        >
          Registrati
        </Button>

        <Button
          component={Link}
          href="/login"
          variant="outlined"
          size="large"
          sx={{ color: "inherit", py: 1.5, fontSize: "1.1rem" }}
        >
          Login
        </Button>

        <Button
          component={Link}
          href="/dashboard"
          variant="outlined"
          size="large"
          sx={{ color: "inherit", py: 1.5, fontSize: "1.1rem" }}
        >
          Dashboard
        </Button>
      </Box>
    </Box >
  );
}

