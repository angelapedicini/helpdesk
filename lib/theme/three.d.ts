import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeBackground {
    subtle: string;
  }

  interface Palette {
    ui: {
      // Standard inputs
      inputBorder: string;
      inputBorderHover: string;
      inputBorderDisabled: string;
      inputTextDisabled: string;

      // Date pickers
      pickerBorder: string;
      pickerBorderHover: string;
      pickerBorderDisabled: string;
      pickerTextDisabled: string;

      //List item
      dashboardItemBorder: string;
      dashboardItemText: string;
      dashboardItemIcon: string;
      dashboardDepartmentBackground: string;
      dashboardDepartmentBackgroundHover: string;
      dashboardCategoryBackground: string;
      dashboardCategoryBackgroundHover: string;

      // Tables
      tableHeaderText: string;
      tableHeaderText: string;
      tableCellBackground: string;
      tableCellText: string;
      tableRowHover: string;
      tableBorder: string;
      highlightedRow: string;
      errorRow: string;
      errorRowHover: string;
      highlightedCell: string;
    };
  }

  interface PaletteOptions {
    ui?: {
      // Standard inputs
      inputBorder?: string;
      inputBorderHover?: string;
      inputBorderDisabled?: string;
      inputTextDisabled?: string;

      // Date pickers
      pickerBorder?: string;
      pickerBorderHover?: string;
      pickerBorderDisabled?: string;
      pickerTextDisabled?: string;

      //List item
      dashboardItemBorder?: string;
      dashboardItemText?: string;
      dashboardItemIcon?: string;
      dashboardDepartmentBackground?: string;
      dashboardDepartmentBackgroundHover?: string;
      dashboardCategoryBackground?: string;
      dashboardCategoryBackgroundHover?: string;

      // Tables
      tableHeaderText?: string;
      tableHeaderText?: string;
      tableCellBackground?: string;
      tableCellText?: string;
      tableRowHover?: string;
      tableBorder?: string;

      highlightedRow?: string;
      errorRow?: string;
      errorRowHover?: string;
      highlightedCell?: string;
    };
  }
}
