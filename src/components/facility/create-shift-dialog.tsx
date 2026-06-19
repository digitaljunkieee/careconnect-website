"use client";

import * as React from "react";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { FacilityShiftForm } from "@/components/facility/shift-form";

type FacilityCreateShiftDialogProps = {
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
  openShiftsCount?: number;
  pendingApplicationsCount?: number;
  profileCompletionPercent?: number;
};

function getDefaultShiftValues() {
  return {
    date: new Date().toISOString(),
    startTime: "",
    endTime: "",
    hourlyRate: 0,
    roleCategory: "",
    customRole: "",
    requiredQualifications: "",
    notes: ""
  };
}

export function FacilityCreateShiftDialog({
  triggerLabel = "Create Shift",
  triggerVariant = "default",
  triggerSize = "default",
  triggerClassName
}: FacilityCreateShiftDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={triggerClassName}
          size={triggerSize}
          variant={triggerVariant}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[min(44rem,calc(100vw-1rem))] max-w-none overflow-hidden p-0 sm:rounded-[28px]">
        <div className="flex max-h-[calc(100svh-1rem)] flex-col">
          <div className="border-b border-border/60 px-5 py-5 sm:px-6">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-2xl">Create Shift</DialogTitle>
              <DialogDescription className="max-w-2xl">
                Add the shift details and publish it.
              </DialogDescription>
            </DialogHeader>
          </div>

          <FacilityShiftForm
            apiUrl="/api/facility/shifts"
            initialValues={getDefaultShiftValues()}
            layout="modal"
            mode="create"
            onSuccess={() => setOpen(false)}
            submitLabel="Create Shift"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
