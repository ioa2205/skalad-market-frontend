"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group rounded-md border border-border bg-bg-elevated text-fg shadow-md text-body-sm",
          description: "text-fg-muted",
          actionButton: "bg-primary-600 text-fg-on-primary",
          cancelButton: "bg-bg-muted text-fg",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
