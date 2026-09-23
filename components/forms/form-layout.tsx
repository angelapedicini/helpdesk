"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";

type FormLayoutProps = {
    children: ReactNode;
    actions?: ReactNode;
    maxHeight?: string | number;
    actionsJustify?: "flex-end" | "stretch";
};

export default function FormLayout({
    children,
    actions,
    maxHeight = "85vh",
    actionsJustify = "flex-end",
}: FormLayoutProps) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                maxHeight,
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                }}
            >
                {children}
            </Box>

            {actions && (
                <Box
                    sx={{
                        flexShrink: 0,
                        mt: 3,
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                        ...(actionsJustify === "stretch" && {
                            "& > *": {
                                flex: "1 1 0",
                                minWidth: 0,
                            },
                        }),
                    }}
                >
                    {actions}
                </Box>
            )}
        </Box>
    );
}