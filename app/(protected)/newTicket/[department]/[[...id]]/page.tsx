"use client";

import { useParams } from "next/navigation";
import {
  Box,
  Typography,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import CreateTicket from "@/components/forms/ticket/create-ticket";
import { DepartmentEnum } from "@/lib/validators/enums.schema";
import { GET_CATEGORY_BY_ID } from "@/apollo-client/queries/ticket-category/ticket-category.queries";

export default function Page() {
  const params = useParams();
  const departmentParam = params.department;

  // Con [[...id]] il segmento è un array opzionale: ["5"] oppure undefined
  const categoryIdParam = Array.isArray(params.id) ? params.id[0] : undefined;

  const parsedDepartment = DepartmentEnum.safeParse(departmentParam);
  const presetDepartment = parsedDepartment.success ? parsedDepartment.data : undefined;

  const categoryId = categoryIdParam !== undefined ? Number(categoryIdParam) : NaN;
  const hasCategoryId = !Number.isNaN(categoryId);

  const { data } = useQuery(GET_CATEGORY_BY_ID, {
    variables: { id: categoryId },
    fetchPolicy: "cache-first",
    skip: !hasCategoryId,
  });

  const category = data?.categoryById;

  return (
    <Box
      sx={{
        width: "100%",
        boxSizing: "border-box",
        p: { xs: 2, sm: 4 },
      }}
    >
      <Typography variant="h4" sx={{ mb: 5 }}>
        Crea Ticket per dipartimento {presetDepartment}
        {hasCategoryId && category ? ` - ${category.name}` : " Nessuna categoria"}
      </Typography>

      <CreateTicket
        department={presetDepartment}
        categoryId={hasCategoryId ? category?.id : undefined}
        onSubmit={async (values) => {
        }}
      />
    </Box>
  );
}