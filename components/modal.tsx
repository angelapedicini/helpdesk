"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from "@mui/icons-material/Close";

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
                // center è sicuro solo perché il wrapper qui sotto è limitato a
                // maxHeight: 100% e lo scroll avviene al suo interno. Con center
                // e wrapper a height: 100% il contenuto traboccerebbe metà
                // sopra e metà sotto, e la parte sopra uscirebbe dal bordo
                // senza che lo scroll la possa recuperare
                justifyContent: "center",
                height: "100%",
              }
            : {},
        },
      }}
    >
      <Box
        sx={{
          // Su mobile questa catena di flex è ciò che abilita lo scroll interno:
          // senza minHeight: 0 il Box intermedio si rifiuta di comprimersi
          // (min-height: auto dei flex item), DialogContent cresce fino a
          // fondo pagina e il suo overflowY: auto non ha nulla su cui scorrere.
          // maxHeight e non height: il wrapper si dimensiona sul contenuto e
          // resta centrato grazie al justifyContent della paper, ma quando il
          // contenuto supera lo schermo si ferma a 100% e lo scroll parte.
          ...(isMobile && {
            display: "flex",
            flexDirection: "column",
            maxHeight: "100%",
            minHeight: 0,
            overflow: "hidden",
          }),
        }}
      >
        <DialogTitle sx={{ flexShrink: 0 }}>
          {title}
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {children}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default Modal;