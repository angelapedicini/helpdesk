"use client";

import { useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import useMediaQuery from "@mui/material/useMediaQuery";
import { darkTheme } from "../theme/theme-dark";
import { lightTheme } from "../theme/theme-light";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import { client } from "../../apollo-client/apollo-client";
import { ApolloProvider } from "@apollo/client/react";
import { GlobalLoadingBar } from "@/components/gloabal-loader";
import { GlobalSnackbar } from "@/components/global-error-snackbar";

export default function Providers({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(() => (prefersDark ? darkTheme : lightTheme), [prefersDark]);

  return (
    <AppRouterCacheProvider options={{ key: "mui", enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
          <ApolloProvider client={client}>
            {children}
            <GlobalLoadingBar />
            <GlobalSnackbar />
          </ApolloProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}