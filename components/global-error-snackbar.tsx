// components/GlobalSnackbar.tsx
"use client";

import { useReactiveVar } from "@apollo/client/react";
import { Snackbar, Alert } from "@mui/material";
import { notificationVar } from "@/lib/apollo-client/notification";

export function GlobalSnackbar() {
  const notification = useReactiveVar(notificationVar);

  return (
    <Snackbar
      key={notification?.id}
      open={!!notification}
      autoHideDuration={5000}
      onClose={(_event, reason) => {
        if (reason === "clickaway") return;
        notificationVar(null);
      }}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={() => notificationVar(null)}
        severity={notification?.severity ?? "info"}
        variant="filled"
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  );
}