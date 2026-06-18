"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      closeButton
      richColors
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "16px"
        }
      }}
      {...props}
    />
  );
}
