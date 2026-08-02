// components/filter-panel.tsx
"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useModalState } from "./hooks/use-modal-state";
import Modal from "./modal";

type Props = {
  title?: string;
  children: ReactNode;
};

const FilterPanelContext = createContext<{
  onClose: () => void;
  activeFilterCount: number;
  setActiveFilterCount: (n: number) => void;
}>({ onClose: () => { }, activeFilterCount: 0, setActiveFilterCount: () => { } });

export const useFilterPanel = () => useContext(FilterPanelContext);

export default function FilterPanel({ title = "Filtri", children }: Props) {
  const modal = useModalState();
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  return (
    <FilterPanelContext.Provider
      value={{ onClose: modal.close, activeFilterCount, setActiveFilterCount }}
    >
      {/* Desktop */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 1.5,
          width: { md: 220 },
          flexShrink: 0,
          maxHeight: "80vh",   // <-- limite massimo, non altezza fissa
          overflowY: "auto",   // <-- scroll quando il contenuto supera il limite
        }}
      >
        <Typography variant="h6" component="div">
          Filtri
        </Typography>

        {children}
      </Box>

      {/* Mobile */}
      <Box sx={{ display: { xs: "block", md: "none" }, width: "100%" }}>
        <Button variant="outlined" fullWidth onClick={modal.open}>
          {title}
          {activeFilterCount > 0 && (
            <Box
              component="span"
              sx={{
                ml: 1,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                width: 20,
                height: 20,
                fontSize: "0.7rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {activeFilterCount}
            </Box>
          )}
        </Button>
        <Modal
          title={title}
          isOpen={modal.isOpen}
          onClose={modal.close}
          keepMounted
        >
          {children}
        </Modal>
      </Box>
    </FilterPanelContext.Provider>
  );
}