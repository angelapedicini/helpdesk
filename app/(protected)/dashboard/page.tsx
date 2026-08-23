"use client";

import { DepartmentEnum } from "@/lib/validators/enums.schema";
import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";

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
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                minHeight: "70vh",
                flexDirection: "column"
            }}
        >
            <Typography variant="h5">Seleziona dipartimento per apertura ticket</Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: 320, mt: 5 }}>
                {DepartmentEnum.options.map((dept) => (
                    <Button
                        key={dept}
                        component={Link}
                        href={`/newTicket/${dept}`}
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