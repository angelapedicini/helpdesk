// lib/theme/theme-light.ts
import { createTheme, type Theme } from "@mui/material/styles";
import { sharedComponents } from "./theme.components";

const shadows = [
    "none",
    "0px 1px 2px rgba(0,0,0,0.4)",
    "0px 2px 4px rgba(0,0,0,0.5)",
    "0px 3px 6px rgba(0,0,0,0.6)",
    ...Array(21).fill("0px 4px 10px rgba(0,0,0,0.25)"),
] as Theme["shadows"];

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        divider: "#c0c2c2",
        primary: {
            main: "#04c992",
            light: "#f8fafc",
            dark: "#00a879",
            contrastText: "#1f2937",
        },
        secondary: {
            main: "#ffffff",
        },
        background: {
            default: "#f5ffff",
            paper: "#ffffff",
            subtle: "#edf0f0",
        },

        text: {
            primary: "#21130d",
            secondary: "#6b7280",
        },
    },
    shape: { borderRadius: 4 },
    typography: {
        fontFamily: "var(--font-geist-sans), Roboto, sans-serif",
        button: { fontWeight: 500, textTransform: "none" },
    },
    shadows,
    components: sharedComponents,
});