"use client";

import * as React from "react";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

type ConfirmationActionButtonProps = {
  children: React.ReactNode;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  triggerVariant?: ButtonProps["variant"];
  confirmVariant?: ButtonProps["variant"];
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  loadingLabel?: string;
};

export function ConfirmationActionButton({
  children,
  title,
  description,
  confirmLabel,
  onConfirm,
  triggerVariant = "outline",
  confirmVariant = "default",
  disabled = false,
  className,
  triggerClassName,
  loadingLabel
}: ConfirmationActionButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  async function handleConfirm() {
    setIsSaving(true);

    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to complete the action."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && setOpen(next)}>
      <DialogTrigger asChild>
        <Button
          className={triggerClassName}
          disabled={disabled}
          variant={triggerVariant}
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={isSaving}
            onClick={() => setOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isSaving}
            onClick={handleConfirm}
            variant={confirmVariant}
          >
            {isSaving ? loadingLabel ?? confirmLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
