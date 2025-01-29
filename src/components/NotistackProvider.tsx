"use client";

import { Close as CloseIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { PropsWithChildren } from "react";

function NotistackProvider({ children }: PropsWithChildren) {
  return (
    <SnackbarProvider
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      action={(key) => (
        <IconButton onClick={() => closeSnackbar(key)}>
          <CloseIcon />
        </IconButton>
      )}
    >
      {children}
    </SnackbarProvider>
  );
}

export default NotistackProvider;
