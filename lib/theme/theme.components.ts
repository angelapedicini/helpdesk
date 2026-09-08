// app/providers/theme/theme.components.ts

import type { Components, Theme } from "@mui/material/styles";
import type { } from "@mui/x-date-pickers/themeAugmentation";

export const sharedComponents: Components<Theme> = {
    // -------------------------------------------------------------------------
    // CSS BASELINE
    // -------------------------------------------------------------------------
    MuiCssBaseline: {
        styleOverrides: (theme) => ({
            "*": {
                scrollbarWidth: "thin",
                scrollbarColor: `${theme.palette.grey[400]} transparent`,
            },

            "*::-webkit-scrollbar": {
                width: 8,
                height: 8,
            },

            "*::-webkit-scrollbar-track": {
                background: "transparent",
            },

            "*::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.grey[400],
                borderRadius: 4,
            },

            "*::-webkit-scrollbar-thumb:hover": {
                backgroundColor: theme.palette.grey[600],
            },
        }),
    },

    // -------------------------------------------------------------------------
    // CARD
    // -------------------------------------------------------------------------
    MuiCard: {
        defaultProps: {
            variant: "outlined",
        },

        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
                transition: "box-shadow 0.15s ease, border-color 0.15s ease",

                "&:hover": {
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                    borderColor: theme.palette.divider,
                },
            }),
        },
    },

    // -------------------------------------------------------------------------
    // TABLE
    // -------------------------------------------------------------------------
    MuiTableContainer: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: 8,
                border: `1px solid ${theme.palette.ui.tableBorder}`,
                boxShadow: "none",
            }),
        },
    },

    MuiTableHead: {
        styleOverrides: {
            root: ({ theme }) => ({
                "& .MuiTableCell-root": {
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: theme.palette.ui.tableHeaderText,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    backgroundColor: theme.palette.background.subtle,
                    borderBottom: `2px solid ${theme.palette.ui.tableBorder}`,
                },
            }),
        },
    },

    MuiTableBody: {
        styleOverrides: {
            root: ({ theme }) => ({
                "& .MuiTableCell-root": {
                    fontSize: "0.875rem",
                    color: theme.palette.ui.tableCellText,
                    borderBottom: `1px solid ${theme.palette.ui.tableBorder}`,
                },

                "& .MuiTableRow:not(.error-row):not(.highlighted-row) .MuiTableCell-root": {
                    backgroundColor: theme.palette.ui.tableCellBackground,
                },
            }),
        },
    },


    MuiTableRow: {
        styleOverrides: {
            root: ({ theme }) => ({
                "&:hover": {
                    "& .MuiTableCell-root": {
                        backgroundColor: theme.palette.ui.tableRowHover,
                    },
                },

                "&.highlighted-row": {
                    "& .MuiTableCell-root": {
                        backgroundColor: theme.palette.ui.highlightedRow,
                    },
                },

                "&.error-row": {
                    "& .MuiTableCell-root": {
                        backgroundColor: theme.palette.ui.errorRow,
                    },

                    "&:hover .MuiTableCell-root": {
                        backgroundColor: theme.palette.ui.errorRowHover,
                    },
                },
            }),
        },
    },


    MuiTableCell: {
        styleOverrides: {
            root: ({ theme }) => ({
                "&.highlighted-cell": {
                    backgroundColor: theme.palette.ui.highlightedCell,
                },
            }),
        },
    },




    // -------------------------------------------------------------------------
    // BUTTON
    // -------------------------------------------------------------------------
    MuiButton: {
        defaultProps: {
            variant: "contained",
        },

        styleOverrides: {
            root: {
                borderRadius: 4,
                paddingTop: 4,
                paddingBottom: 4,
                boxShadow: "none",

                "&:hover": {
                    boxShadow: "none",
                    opacity: 0.9,
                },
            },
        },
    },

    // -------------------------------------------------------------------------
    // TEXT FIELD
    // -------------------------------------------------------------------------
    MuiTextField: {
        defaultProps: {
            size: "small",
            fullWidth: true,
        },
    },

    // -------------------------------------------------------------------------
    // FORM CONTROL
    // -------------------------------------------------------------------------
    MuiFormControl: {
        defaultProps: {
            size: "small",
            fullWidth: true,
        },
    },

    // -------------------------------------------------------------------------
    // SELECT
    // -------------------------------------------------------------------------
    MuiSelect: {
        defaultProps: {
            size: "small",
        },

        styleOverrides: {
            icon: ({ theme }) => ({
                "&.Mui-disabled": {
                    color: theme.palette.ui.inputTextDisabled,
                },
            }),
        },
    },

    // -------------------------------------------------------------------------
    // INPUT LABEL
    // -------------------------------------------------------------------------
    MuiInputLabel: {
        styleOverrides: {
            root: ({ theme }) => ({
                "&.Mui-disabled": {
                    color: theme.palette.ui.inputTextDisabled,
                },
            }),
        },
    },

    // -------------------------------------------------------------------------
    // DATE PICKER
    // -------------------------------------------------------------------------
    MuiDatePicker: {
        defaultProps: {
            slotProps: {
                textField: {
                    size: "small",
                    fullWidth: true,
                    variant: "outlined",
                },
            },
        },
    },

    // -------------------------------------------------------------------------
    // STANDARD OUTLINED INPUT
    // -------------------------------------------------------------------------
    MuiOutlinedInput: {
        styleOverrides: {
            root: ({ theme }) => ({
                "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.ui.inputBorder,
                },

                "&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.ui.inputBorderHover,
                    borderWidth: "1.7px",
                },


                "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.ui.inputBorderDisabled,
                },
            }),

            input: ({ theme }) => ({
                "&.Mui-disabled": {
                    color: theme.palette.ui.inputTextDisabled,
                    WebkitTextFillColor: theme.palette.ui.inputTextDisabled,
                },
            }),
        },
    },

    // -------------------------------------------------------------------------
    // DATE PICKER OUTLINED INPUT
    // -------------------------------------------------------------------------
    MuiPickersOutlinedInput: {
        styleOverrides: {
            root: ({ theme }) => ({
                "& .MuiPickersOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.ui.pickerBorder,
                },

                "&:hover:not(.Mui-disabled) .MuiPickersOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.ui.pickerBorderHover,
                    borderWidth: "1.7px",
                },


                "&.Mui-disabled .MuiPickersOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.ui.pickerBorderDisabled,
                },
            }),
        },
    },


    // -------------------------------------------------------------------------
    // DATE PICKER INPUT BASE
    // -------------------------------------------------------------------------
    MuiPickersInputBase: {
        styleOverrides: {
            root: ({ theme }) => ({
                "&.Mui-disabled .MuiPickersSectionList-sectionContent": {
                    color: theme.palette.ui.pickerTextDisabled,
                    WebkitTextFillColor: theme.palette.ui.pickerTextDisabled,
                },
            }),
        },
    },


    // -------------------------------------------------------------------------
    // LIST ITEM BUTTON
    // -------------------------------------------------------------------------
    MuiListItemButton: {
        styleOverrides: {
            root: ({ theme }) => ({
                "&.dashboard-department": {
                    border: "1px solid",
                    borderColor: theme.palette.ui.dashboardItemBorder,
                    borderRadius: 8,
                    backgroundColor: theme.palette.ui.dashboardDepartmentBackground,
                    color: theme.palette.ui.dashboardItemText,

                    "&:hover": {
                        backgroundColor:
                            theme.palette.ui.dashboardDepartmentBackgroundHover,
                    },
                },

                "&.dashboard-category": {
                    border: "1px solid",
                    borderColor: theme.palette.ui.dashboardItemBorder,
                    borderRadius: 8,
                    color: theme.palette.ui.dashboardItemText,
                    backgroundColor: theme.palette.ui.dashboardCategoryBackground,

                    "&:hover": {
                        backgroundColor:
                            theme.palette.ui.dashboardCategoryBackgroundHover,
                    },
                },

            }),
        },
    },

};
