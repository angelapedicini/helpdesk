// lib/theme/theme-light.ts
import { createTheme, type Theme } from "@mui/material/styles";
import { sharedComponents } from "./theme.components";

const shadows = [
    "none",
    "0px 1px 2px rgba(0,0,0,0.05)",
    "0px 2px 4px rgba(0,0,0,0.06)",
    "0px 3px 6px rgba(0,0,0,0.08)",
    ...Array(21).fill("0px 4px 10px rgba(0,0,0,0.1)"),
] as Theme["shadows"];

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        divider: "#e2e8f0",
        primary: {
            main: "#1f2937",
            light: "#374151",
            dark: "#111827",
            contrastText: "#f8fafc",
        },
        secondary: {
            main: "#64748b",
        },
        background: {
            default: "#f8fafc",
            paper: "#ffffff",
            subtle: "#f1f5f9",
        },
        text: {
            primary: "#111827",
            secondary: "#6b7280",
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
                        borderColor: "#8c8f96",
                    },
                },
            },
        },
        MuiPickersOutlinedInput: {
            styleOverrides: {
                root: {
                    "& .MuiPickersOutlinedInput-notchedOutline": {
                        borderColor: "#8c8f96",
                    },
                },
            },
        },
    },
});