"use client";

import EntityForm from "@/components/form-engine/entity-form";
import { useTicketFormConfig } from "@/components/forms/ticket/ticket.config";
import { Box } from "@mui/material";
import { useParams } from "next/navigation";
import { DepartmentEnum } from "@/lib/validators/auth.schema";

export default function Page() {
  const params = useParams();
  const departmentParam = params.id; // valore = "HR", "IT", ecc.

  const parsedDepartment = DepartmentEnum.safeParse(departmentParam);
  const presetDepartment = parsedDepartment.success ? parsedDepartment.data : undefined;

  const ticketFormConfig = useTicketFormConfig({ after: null }, undefined, presetDepartment);

  return (
    <Box sx={{ mt: 5, width: "50vw", mx: "auto" }}>
      <EntityForm config={ticketFormConfig} />
    </Box>
  );
}