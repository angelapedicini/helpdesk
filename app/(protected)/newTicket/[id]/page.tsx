// "use client";

// import EntityForm from "@/components/form-engine/entity-form";
// import { useTicketFormConfig } from "@/components/forms/ticket/ticket.config";
// import { Box } from "@mui/material";
// import { useParams } from "next/navigation";
// import { DepartmentEnum } from "@/lib/validators/auth.schema";

// export default function Page() {
//   const params = useParams();
//   const departmentParam = params.id; // valore = "HR", "IT", ecc.

//   const parsedDepartment = DepartmentEnum.safeParse(departmentParam);
//   const presetDepartment = parsedDepartment.success ? parsedDepartment.data : undefined;

//   const ticketFormConfig = useTicketFormConfig({ after: null }, undefined, presetDepartment);

//   return (
//     <Box sx={{ mt: 5, width: "50vw", mx: "auto" }}>
//       <EntityForm config={ticketFormConfig} />
//     </Box>
//   );
// }


"use client";

import { useParams } from "next/navigation";
import {
  Box,
  Typography,
} from "@mui/material";
import CreateTicket from "@/components/forms/ticket/create-ticket";
import { DepartmentEnum } from "@/lib/validators/enums.schema";

export default function Page() {
  const params = useParams();
  const departmentParam = params.id; // valore = "HR", "IT", ecc.

  const parsedDepartment = DepartmentEnum.safeParse(departmentParam);
  const presetDepartment = parsedDepartment.success ? parsedDepartment.data : undefined;


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
      </Box>

      {/* Form modificabile */}

      <CreateTicket
        department={presetDepartment}
        onSubmit={async (values) => {
          // update ticket
        }}
      />

    </Box>
  );
}

