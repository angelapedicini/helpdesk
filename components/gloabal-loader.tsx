// components/GlobalLoadingBar.tsx
"use client";

import { useReactiveVar } from "@apollo/client/react";
import { CircularProgress, Box } from "@mui/material";
import { loadingVar } from "@/lib/apollo-client/loading-link";

export function GlobalLoadingBar() {
  const count = useReactiveVar(loadingVar);

  if (count === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2000,
      }}
    >
      <CircularProgress size={48} />
    </Box>
  );
}