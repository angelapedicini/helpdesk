"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from "@mui/icons-material/Close";
import { Typography } from "@mui/material";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  keepMounted?: boolean;
}

const Modal = ({
  title,
  children,
  isOpen,
  onClose,
  keepMounted,
}: ModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      disableRestoreFocus
      keepMounted={keepMounted}
      slotProps={{
        paper: {
          sx: isMobile
            ? {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
              }
            : {},
        },
      }}
    >
      <Box>
        <DialogTitle>
          {title}
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {children}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default Modal;