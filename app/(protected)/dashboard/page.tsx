"use client";

import { useAppQuery } from "@/lib/apollo-client/hooks/query-hook";
import { useModalState } from "@/components/hooks/use-modal-state";
import { useAppMutation } from "@/lib/apollo-client/hooks/mutation-hook";
import Modal from "@/components/modal";

import {
  Box
} from "@mui/material";
import SureForm from "@/components/forms/sure-form";

export default function Page() {

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%", minHeight: "100vh" }}>
    
    </Box>
  );
}