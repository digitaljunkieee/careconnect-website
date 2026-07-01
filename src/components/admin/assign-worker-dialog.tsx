"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import type { AdminWorkerOption } from "@/lib/admin-platform";

type AssignWorkerDialogProps = {
  shiftId: string;
  workers: AdminWorkerOption[];
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to assign shift.";
}

export function AssignWorkerDialog({ shiftId, workers }: AssignWorkerDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [workerId, setWorkerId] = React.useState(workers[0]?.id ?? "");
  const [notes, setNotes] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  async function handleSubmit() {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/shifts/${shiftId}/assign-worker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workerId,
          notes
        })
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      toast.success("Worker assigned.");
      setOpen(false);
      setNotes("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to assign worker.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && setOpen(next)}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl" size="sm" variant="outline" disabled={!workers.length}>
          Assign worker
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign worker</DialogTitle>
          <DialogDescription>
            Select a verified worker and add any note for the shift handoff.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`worker-${shiftId}`}>
              Worker
            </label>
            <select
              className="h-11 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"
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
              placeholder="Optional note for the worker or facility"
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isSaving} variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isSaving || !workerId} onClick={handleSubmit}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSaving ? "Assigning..." : "Assign worker"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
