"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, TextField, Typography } from "@mui/material";
import {
    GET_CATEGORY_BY_ID,
    GET_CATEGORY_ACCESSES,
} from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { ROLE_CONFIG } from "@/components/enums/role.config";
import { SPECIFIC_FIELD_LABELS } from "@/lib/config/ticket-specific-field.config";
import { getCategoryAccessMatrix } from "../column.def";
import { Department } from "@/lib/validators/enums.schema";

const ACCESS_DEPARTMENTS = Object.keys(DEPARTMENT_CONFIG) as Department[];

export default function Page() {
    const { id } = useParams();

    const categoryId = typeof id === "string" ? Number(id) : NaN;

    const { data: categoryData } = useQuery(GET_CATEGORY_BY_ID, {
        variables: { id: categoryId },
        skip: !Number.isInteger(categoryId),
    });

    const { data: accessesData } = useQuery(GET_CATEGORY_ACCESSES, {
        variables: { categoryId },
        skip: !Number.isInteger(categoryId),
    });

    if (!Number.isInteger(categoryId)) {
        return (
            <Typography align="center">
                ID categoria non valido.
            </Typography>
        );
    }

    const category = categoryData?.categoryById;
    if (!category) {
        return null;
    }

    const matrix = getCategoryAccessMatrix(
        category.id,
        accessesData?.categoryAccesses ?? []
    );

    return (
        <Box
            sx={{
                width: "100%",
                boxSizing: "border-box",
                p: { xs: 2 },
            }}
        >
            <Typography variant="h4" sx={{ mb: 2 }}>
                Categoria # {category.id} — {category.name}
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                    },
                    gap: 3,
                    mb: 3,
                }}
            >
                <TextField
                    label="Nome"
                    value={category.name}
                    fullWidth
                    disabled
                />

                <TextField
                    label="Dipartimento"
                    value={
                        DEPARTMENT_CONFIG[category.department]?.label ??
                        category.department
                    }
                    fullWidth
                    disabled
                />

                <TextField
                    label="Campo specifico"
                    value={
                        category.specificField
                            ? SPECIFIC_FIELD_LABELS[category.specificField] ??
                              category.specificField
                            : "—"
                    }
                    fullWidth
                    disabled
                />

                <TextField
                    label="Stato"
                    value={category.disabled ? "Disabilitata" : "Attiva"}
                    fullWidth
                    disabled
                />
            </Box>

            <Typography variant="h6" sx={{ mb: 2 }}>
                Accessi per dipartimento
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                    },
                    gap: 3,
                }}
            >
                {ACCESS_DEPARTMENTS.map((department) => {
                    const role = matrix[department];
                    return (
                        <TextField
                            key={department}
                            label={`Accesso ${DEPARTMENT_CONFIG[department]?.label ?? department}`}
                            value={role ? (ROLE_CONFIG[role]?.label ?? role) : "—"}
                            fullWidth
                            disabled
                        />
                    );
                })}
            </Box>
        </Box>
    );
}