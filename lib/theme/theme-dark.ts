// app/providers/theme/theme-dark.ts

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
      secondary: "#ffffff",
    },

    ui: {
      // Standard inputs
      inputBorder: "#ffffff",
      inputBorderHover: "#ffffff",
      inputBorderDisabled: "#7c7c7c",
      // inputTextDisabled: "#bebebe",
      inputTextDisabled: "#ffffff",

      // Date pickers
      pickerBorder: "#ffffff",
      pickerBorderHover: "#f3f0f0",
      pickerBorderDisabled: "#7c7c7c",
      // pickerTextDisabled: "#bebebe",
      pickerTextDisabled: "#ffffff",


      // Tabless
      tableHeaderText: "#d1d5db",
      tableCellBackground: "#18181b",
      tableCellText: "#f9fafb",
      // tableRowHover: "rgba(255, 255, 255, 0.04)",
      tableBorder: "#3f3f46",
      highlightedRow: "#581414",
      errorRow: "#581414",
      errorRowHover: "#6b1a1a",
      highlightedCell: "#44402d",

      //list item
      dashboardItemBorder: "#85858a",
      dashboardItemText: "#f9fafb",
      dashboardDepartmentBackground: "#232c3a",
      dashboardDepartmentBackgroundHover: "rgba(255, 255, 255, 0.04)",
      dashboardCategoryBackground: "#303f55",
      dashboardCategoryBackgroundHover: "rgba(72, 88, 112, 1)",
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
