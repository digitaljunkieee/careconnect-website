"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmationActionButton } from "@/components/confirmation-action-button";

type EntityToggleActionsProps = {
  viewHref: string;
  endpoint: string;
  entityLabel: string;
  isActive: boolean;
  deleteEndpoint?: string;
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update record.";
}

export function EntityToggleActions({
  viewHref,
  endpoint,
  entityLabel,
  isActive,
  deleteEndpoint
}: EntityToggleActionsProps) {
  const router = useRouter();
  const nextState = isActive ? "disable" : "enable";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild className="rounded-2xl" variant="outline" size="sm">
        <Link href={viewHref}>View</Link>
      </Button>
      <ConfirmationActionButton
        confirmLabel={isActive ? "Disable" : "Enable"}
        confirmVariant={isActive ? "secondary" : "default"}
        description={`This will ${nextState} the ${entityLabel.toLowerCase()} account.`}
        onConfirm={async () => {
          const response = await fetch(endpoint, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ isActive: !isActive })
          });

          if (!response.ok) {
            throw new Error(await parseApiError(response));
          }

          toast.success(
            isActive
              ? `${entityLabel} disabled.`
              : `${entityLabel} enabled.`
          );
          router.refresh();
        }}
        title={`${isActive ? "Disable" : "Enable"} ${entityLabel}?`}
        triggerClassName="rounded-2xl"
        triggerVariant="outline"
      >
        {isActive ? "Disable" : "Enable"}
      </ConfirmationActionButton>
      {deleteEndpoint ? (
        <ConfirmationActionButton
          confirmLabel="Delete"
          confirmVariant="destructive"
          description={`This will permanently delete the ${entityLabel.toLowerCase()} account and related records.`}
          onConfirm={async () => {
            const response = await fetch(deleteEndpoint, {
              method: "DELETE"
            });

            if (!response.ok) {
              throw new Error(await parseApiError(response));
            }

            toast.success(`${entityLabel} deleted.`);
            router.refresh();
          }}
          title={`Delete ${entityLabel}?`}
          triggerClassName="rounded-2xl"
          triggerVariant="outline"
        >
          Delete
        </ConfirmationActionButton>
      ) : null}
    </div>
  );
}
