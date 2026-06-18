"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmationActionButton } from "@/components/confirmation-action-button";
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
import type { AdminWorkerOption } from "@/lib/admin-platform";
import type { ShiftStatus } from "@/lib/constants";

type ShiftActionsProps = {
  shiftId: string;
  status: ShiftStatus;
  workers: AdminWorkerOption[];
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update shift.";
}

function ReassignDialog({ shiftId, workers }: { shiftId: string; workers: AdminWorkerOption[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [workerId, setWorkerId] = React.useState(workers[0]?.id ?? "");
  const [notes, setNotes] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  async function handleSubmit() {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/shifts/${shiftId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
          body: JSON.stringify({
            action: "REASSIGN",
            workerId,
            notes
          })
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      toast.success("Shift reassigned.");
      setOpen(false);
      setNotes("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update shift.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && setOpen(next)}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl" variant="outline" size="sm" disabled={!workers.length}>
          Reassign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign shift</DialogTitle>
          <DialogDescription>
            Pick a verified worker and add any context for the reassignment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`worker-${shiftId}`}>
              Worker
            </label>
            <select
              className="w-full rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm"
              id={`worker-${shiftId}`}
              value={workerId}
              onChange={(event) => setWorkerId(event.target.value)}
            >
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} {worker.email ? `(${worker.email})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`notes-${shiftId}`}>
              Notes
            </label>
            <Textarea
              id={`notes-${shiftId}`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional note for the team"
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isSaving} variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isSaving || !workerId} onClick={handleSubmit}>
            {isSaving ? "Saving..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShiftActions({ shiftId, status, workers }: ShiftActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild className="rounded-2xl" variant="outline" size="sm">
        <Link href={`/dashboard/admin/shifts/${shiftId}`}>View</Link>
      </Button>
      <ReassignDialog shiftId={shiftId} workers={workers} />
      <ConfirmationActionButton
        confirmLabel="Cancel"
        confirmVariant="secondary"
        description="This will close the shift and cancel the related applications."
        onConfirm={async () => {
          const response = await fetch(`/api/admin/shifts/${shiftId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              action: "CANCEL"
            })
          });

          if (!response.ok) {
            throw new Error(await parseApiError(response));
          }

          toast.success("Shift cancelled.");
          router.refresh();
        }}
        title="Cancel this shift?"
        triggerClassName="rounded-2xl"
        triggerVariant="outline"
        disabled={status === "CLOSED"}
      >
        Cancel
      </ConfirmationActionButton>
    </div>
  );
}
