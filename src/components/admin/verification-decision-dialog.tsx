"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ButtonProps } from "@/components/ui/button";

type VerificationDecisionDialogProps = {
  workerProfileId: string;
  decision: "APPROVE" | "REJECT";
  triggerLabel: string;
  triggerVariant?: ButtonProps["variant"];
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update verification.";
}

export function VerificationDecisionDialog({
  workerProfileId,
  decision,
  triggerLabel,
  triggerVariant = "outline"
}: VerificationDecisionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  async function handleSubmit() {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/verifications/${workerProfileId}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ decision, notes })
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      toast.success(
        decision === "APPROVE"
          ? "Verification approved."
          : "Verification rejected."
      );
      setOpen(false);
      setNotes("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update verification.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && setOpen(next)}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl" variant={triggerVariant} size="sm">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {decision === "APPROVE" ? "Approve verification?" : "Reject verification?"}
          </DialogTitle>
          <DialogDescription>
            Add optional admin notes before recording the decision and notifying the worker.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Textarea
            className="min-h-32"
            placeholder="Add notes for the worker or review team"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isSaving}
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={handleSubmit}>
            {isSaving ? "Saving..." : decision === "APPROVE" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
