"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ApplicationActionsProps = {
  applicationId: string;
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update application.";
}

async function updateApplication(applicationId: string, action: "ACCEPT" | "REJECT" | "ASSIGN") {
  const response = await fetch(`/api/admin/applications/${applicationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ action, notes: "" })
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export function ApplicationActions({ applicationId }: ApplicationActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        className="rounded-2xl"
        size="sm"
        onClick={async () => {
          try {
            await updateApplication(applicationId, "ACCEPT");
            toast.success("Application accepted.");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to update application.");
          }
        }}
      >
        Accept
      </Button>
      <Button
        className="rounded-2xl"
        size="sm"
        variant="outline"
        onClick={async () => {
          try {
            await updateApplication(applicationId, "REJECT");
            toast.success("Application rejected.");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to update application.");
          }
        }}
      >
        Reject
      </Button>
      <Button
        className="rounded-2xl"
        size="sm"
        variant="outline"
        onClick={async () => {
          try {
            await updateApplication(applicationId, "ASSIGN");
            toast.success("Worker assigned to shift.");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to update application.");
          }
        }}
      >
        Assign
      </Button>
    </div>
  );
}
