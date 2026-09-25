// app/providers/theme/theme-light.ts

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
            subtle: "#dde0e4",
        },

        text: {
            primary: "#111827",
            secondary: "#262729",
        },

        ui: {
            // Standard inputs
            inputBorder: "#000000",
            inputBorderHover: "#000000",
            inputBorderDisabled: "#cacaca",
            inputTextDisabled: "#000000",



            // Date pickers
            pickerBorder: "#000000",
            pickerBorderHover: "#000000",
            pickerBorderDisabled: "#dad9d9",
            pickerTextDisabled: "#000000",

            // Tables
            tableHeaderText: "#374151",
            tableCellBackground: "#ffffff",
            tableCellText: "#111827",
            tableRowHover: "rgba(12, 2, 2, 0.04)",
            tableBorder: "#e2e8f0",
            highlightedRow: "#fde8e8",
            errorRow: "#f8cdcd",
            errorRowHover: "#f5bcbc",
            highlightedCell: "#fde8a3",

            //List item
            dashboardItemBorder: "#262729",
            dashboardItemText: "#111827",
            dashboardDepartmentBackground: "#dde0e4",
            dashboardDepartmentBackgroundHover: "rgba(7, 6, 6, 0.08)",
            dashboardCategoryBackground: "#ffffff",
            dashboardCategoryBackgroundHover: "rgba(196, 85, 85, 0.08)",
        },
    },

    shape: {
        borderRadius: 4,
    },

    typography: {
        fontFamily: "var(--font-geist-sans), Roboto, sans-serif",

        button: {
            fontWeight: 500,
            textTransform: "none",
        },
    },

    shadows,

    components: {
        ...sharedComponents,
    },
});
