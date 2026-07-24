"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type Props = {
  testo: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function SureForm({ testo, onConfirm, onCancel }: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      <Typography variant="body2">
        Sei sicuro di voler {testo} la risorsa?
      </Typography>

      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button variant="outlined" size="small" onClick={onCancel}>
          Annulla
        </Button>
        <Button variant="contained" size="small" onClick={onConfirm}>
          Conferma
        </Button>
      </Box>
    </Box>
  );
}