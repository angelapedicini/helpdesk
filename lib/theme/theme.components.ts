// lib/theme/theme.components.ts
import type { Components, Theme } from "@mui/material/styles";

export const sharedComponents: Components<Theme> = {
    MuiCard: {
        defaultProps: { variant: "outlined" },
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
                transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                "&:hover": {
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
                    borderColor: theme.palette.divider,
                },
            }),
        },
    },
    MuiTableHead: {
        styleOverrides: {
            root: ({ theme }) => ({
                "& .MuiTableCell-root": {
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    backgroundColor: theme.palette.background.subtle,
                    borderBottom: `2px solid ${theme.palette.divider}`,
                },
            }),
        },
    },
    MuiTableBody: {
        styleOverrides: {
            root: ({ theme }) => ({
                "& .MuiTableRow-root:hover": {
                    backgroundColor: theme.palette.action.hover,
                },
                "& .MuiTableCell-root": {
                    fontSize: "0.875rem",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                },
            }),
        },
    },
    MuiTableContainer: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
            }),
        },
    },
    MuiButton: {
        defaultProps: { variant: "contained" },
        styleOverrides: {
            root: {
                borderRadius: 4,
                paddingTop: 4,
                paddingBottom: 4,
                boxShadow: "none",
                "&:hover": { boxShadow: "none", opacity: 0.9 },
            },
        },
    },
    MuiTextField: {
        defaultProps: {
            size: "small",
            fullWidth: true,
        },
    },
    MuiFormControl: {
        defaultProps: {
            size: "small",
            fullWidth: true,
        },
    },
    MuiSelect: {
        defaultProps: {
            size: "small",
        },
    },
};