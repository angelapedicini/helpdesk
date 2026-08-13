// lib/theme/theme-dark.ts
import { createTheme, type Theme } from "@mui/material/styles";
import { sharedComponents } from "./theme.components";

const shadows = [
  "none",
  "0px 1px 2px rgba(0,0,0,0.2)",
  "0px 2px 4px rgba(0,0,0,0.25)",
  "0px 3px 6px rgba(0,0,0,0.3)",
  ...Array(21).fill("0px 4px 10px rgba(0,0,0,0.35)"),
] as Theme["shadows"];

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    divider: "#4b5563",
    primary: {
      main: "#f1f5f9",
      light: "#f8fafc",
      dark: "#e2e8f0",
      contrastText: "#1f2937",
    },
    secondary: {
      main: "#94a3b8",
    },
    background: {
      default: "#111827",
      paper: "#1f2937",
      subtle: "#16202e",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#9ca3af",
    },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: "var(--font-geist-sans), Roboto, sans-serif",
    button: { fontWeight: 500, textTransform: "none" },
  },
  shadows,
  components: {
    ...sharedComponents,

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c7c7c7",
          },
        },

        // input: {
        //   "&.Mui-disabled": {
        //     WebkitTextFillColor: "#63666d",
        //   },
        // },
      },
    },
    MuiPickersOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiPickersOutlinedInput-notchedOutline": {
            borderColor: "#c7c7c7",
          },

          // "&:hover .MuiPickersOutlinedInput-notchedOutline": {
          //   borderColor: "#21130d",
          // },

          // "&.Mui-focused .MuiPickersOutlinedInput-notchedOutline": {
          //   borderColor: "#21130d",
          // },

          // "&.Mui-disabled .MuiPickersOutlinedInput-notchedOutline": {
          //   borderColor: "#21130d",
          // },
        },
      },
    },
  },
});