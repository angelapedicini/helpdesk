// app/providers/theme/theme.d.ts  ← stessa cartella dei tuoi temi
import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeBackground {
    subtle: string;
  }
  
}