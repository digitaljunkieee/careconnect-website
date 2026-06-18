"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationActionButton } from "@/components/confirmation-action-button";
import type { ShiftStatus } from "@/lib/constants";

type FacilityShiftActionsProps = {
  shiftId: string;
  status: ShiftStatus;
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update shift.";
}

export function FacilityShiftActions({ shiftId, status }: FacilityShiftActionsProps) {
  const router = useRouter();

  const nextStatus = status === "OPEN" ? "CLOSED" : status === "CLOSED" ? "OPEN" : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild className="rounded-2xl" variant="outline" size="sm">
        <Link href={`/dashboard/facility/shifts/${shiftId}/edit`}>Edit</Link>
      </Button>
      <Button asChild className="rounded-2xl" variant="outline" size="sm">
        <Link href={`/dashboard/facility/shifts/${shiftId}/applications`}>
          Applicants
        </Link>
      </Button>
      {nextStatus ? (
        <ConfirmationActionButton
          confirmLabel={nextStatus === "OPEN" ? "Reopen" : "Close"}
          confirmVariant={nextStatus === "OPEN" ? "default" : "secondary"}
          description={
            nextStatus === "OPEN"
              ? "This shift will become visible to workers again."
              : "This shift will stop accepting new applications."
          }
          onConfirm={async () => {
            const response = await fetch(`/api/facility/shifts/${shiftId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ status: nextStatus })
            });

            if (!response.ok) {
              throw new Error(await parseApiError(response));
            }

            toast.success(
              nextStatus === "OPEN" ? "Shift reopened." : "Shift closed."
            );
            router.refresh();
          }}
          title={nextStatus === "OPEN" ? "Reopen this shift?" : "Close this shift?"}
          triggerClassName="rounded-2xl"
          triggerVariant="outline"
        >
          {nextStatus === "OPEN" ? "Reopen" : "Close"}
        </ConfirmationActionButton>
      ) : (
        <Badge variant="secondary" className="rounded-full">
          Filled
        </Badge>
      )}
      <ConfirmationActionButton
        confirmLabel="Delete"
        confirmVariant="destructive"
        description="This will permanently remove the shift and its related applications."
        onConfirm={async () => {
          const response = await fetch(`/api/facility/shifts/${shiftId}`, {
            method: "DELETE"
          });

          if (!response.ok) {
            throw new Error(await parseApiError(response));
          }

          toast.success("Shift deleted.");
          router.refresh();
        }}
        title="Delete this shift?"
        triggerClassName="rounded-2xl"
        triggerVariant="outline"
      >
        Delete
      </ConfirmationActionButton>
    </div>
  );
}
