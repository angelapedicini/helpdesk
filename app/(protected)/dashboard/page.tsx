"use client";

import { Box, Button } from "@mui/material";
import Link from "next/link";
import { DepartmentEnum } from "@/lib/validators/auth.schema";

const DEPARTMENT_LABELS: Record<string, string> = {
    HR: "Risorse Umane",
    IT: "IT",
    FINANCE: "Finance",
    SALES: "Sales",
    MARKETING: "Marketing",
};

export default function Page() {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center", // centro orizzontale
                alignItems: "center",     // centro verticale
                width: "100%",
                minHeight: "70vh",
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: 320 }}>
                {DepartmentEnum.options.map((dept) => (
                    <Button
                        key={dept}
                        component={Link}
                        href={`/dashboard/newTicket/${dept}`}
                        variant="outlined"
                        size="large"
                        sx={{ color: "inherit", py: 1.5, fontSize: "1.1rem" }}
                    >
                        {DEPARTMENT_LABELS[dept]}
                    </Button>
                ))}
            </Box>
        </Box>
    );
}