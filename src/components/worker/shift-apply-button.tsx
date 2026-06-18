"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationActionButton } from "@/components/confirmation-action-button";

type ShiftApplyButtonProps = {
  shiftId: string;
  alreadyApplied: boolean;
  canApply: boolean;
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to apply to shift.";
}

export function ShiftApplyButton({
  shiftId,
  alreadyApplied,
  canApply
}: ShiftApplyButtonProps) {
  const router = useRouter();

  if (alreadyApplied) {
    return <Badge variant="secondary">Applied</Badge>;
  }

  if (!canApply) {
    return (
      <Button className="rounded-2xl" disabled variant="outline">
        Verification required
      </Button>
    );
  }

  return (
    <ConfirmationActionButton
      confirmLabel="Apply"
      description="Your application will be submitted immediately and the facility will be notified."
      onConfirm={async () => {
        const response = await fetch("/api/worker/applications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ shiftId })
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }

        toast.success("Application submitted.");
        router.refresh();
      }}
      title="Apply to this shift?"
      triggerVariant="outline"
    >
      Apply
    </ConfirmationActionButton>
  );
}
