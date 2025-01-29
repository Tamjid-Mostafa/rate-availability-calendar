"use client";

import QueryProvider from "@/components/QueryProvider";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers-pro/LocalizationProvider";
import NotistackProvider from "./NotistackProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotistackProvider>
      <QueryProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {children}
        </LocalizationProvider>
      </QueryProvider>
    </NotistackProvider>
  );
}
