"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ConfirmationActionButton } from "@/components/confirmation-action-button";

type ApplicationDecisionActionsProps = {
  applicationId: string;
  status: string;
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update application.";
}

export function ApplicationDecisionActions({
  applicationId,
  status
}: ApplicationDecisionActionsProps) {
  const router = useRouter();

  if (status !== "PENDING") {
    const variant =
      status === "ACCEPTED"
        ? "soft"
        : status === "REJECTED"
          ? "destructive"
          : "secondary";

    return <Badge variant={variant}>{status}</Badge>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <ConfirmationActionButton
        confirmLabel="Accept"
        confirmVariant="default"
        description="Accepting this application will fill the shift, create an assignment, and reject the other pending applicants."
        onConfirm={async () => {
          const response = await fetch(
            `/api/facility/applications/${applicationId}/decision`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ action: "ACCEPT" })
            }
          );

          if (!response.ok) {
            throw new Error(await parseApiError(response));
          }

          toast.success("Application accepted.");
          router.refresh();
        }}
        title="Accept this applicant?"
        triggerClassName="h-8 rounded-xl px-3 text-xs font-semibold"
        triggerVariant="outline"
      >
        Accept
      </ConfirmationActionButton>
      <ConfirmationActionButton
        confirmLabel="Reject"
        confirmVariant="destructive"
        description="Rejecting this application will keep the shift open for the other applicants."
        onConfirm={async () => {
          const response = await fetch(
            `/api/facility/applications/${applicationId}/decision`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ action: "REJECT" })
            }
          );

          if (!response.ok) {
            throw new Error(await parseApiError(response));
          }

          toast.success("Application rejected.");
          router.refresh();
        }}
        title="Reject this applicant?"
        triggerClassName="h-8 rounded-xl px-3 text-xs font-semibold"
        triggerVariant="outline"
      >
        Reject
      </ConfirmationActionButton>
    </div>
  );
}
