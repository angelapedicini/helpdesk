"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, Typography } from "@mui/material";
import {
    GET_CATEGORY_BY_ID,
    GET_CATEGORY_ACCESSES,
} from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import CategoryDetailForm from "@/components/forms/category/category-detail-form";

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

            <CategoryDetailForm
                category={category}
                accesses={accessesData?.categoryAccesses ?? []}
            />
        </Box>
    );
}