"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { ShiftStatus } from "@/lib/constants";

type FacilityShiftActionsProps = {
  shiftId: string;
  status: ShiftStatus;
  applicationCount: number;
};

type PendingAction = "close" | "delete" | null;

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update shift.";
}

function getCloseActionLabel(status: ShiftStatus) {
  return status === "OPEN" ? "Close Shift" : "Reopen Shift";
}

function getCloseActionDescription(status: ShiftStatus) {
  return status === "OPEN"
    ? "This shift will stop accepting new applications."
    : "This shift will become visible to workers again.";
}

export function FacilityShiftActions({
  shiftId,
  status,
  applicationCount
}: FacilityShiftActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = React.useState<PendingAction>(null);

  const isCloseAction = pendingAction === "close";
  const dialogTitle =
    pendingAction === "delete"
      ? "Delete this shift?"
      : isCloseAction
        ? `${getCloseActionLabel(status)}?`
        : "";
  const dialogDescription =
    pendingAction === "delete"
      ? "This will permanently remove the shift and its related applications."
      : isCloseAction
        ? getCloseActionDescription(status)
        : "";
  const confirmLabel = pendingAction === "delete" ? "Delete Shift" : getCloseActionLabel(status);

  async function handleConfirm() {
    try {
      if (pendingAction === "delete") {
        const response = await fetch(`/api/facility/shifts/${shiftId}`, {
          method: "DELETE"
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }

        toast.success("Shift deleted.");
      } else if (pendingAction === "close") {
        const response = await fetch(`/api/facility/shifts/${shiftId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: status === "OPEN" ? "CLOSED" : "OPEN" })
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }

        toast.success(status === "OPEN" ? "Shift closed." : "Shift reopened.");
      }

      router.refresh();
      setPendingAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update shift.");
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        asChild
        className="h-9 rounded-xl border-transparent bg-[#076c82] px-3 text-sm font-semibold text-white shadow-none hover:bg-[#065a6b] hover:text-white"
        size="sm"
      >
        <Link href={`/dashboard/facility/shifts/${shiftId}/applications`}>
          Applicants ({applicationCount})
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open shift actions"
            className="h-9 w-9 rounded-xl border border-border/70 bg-background/65 p-0 shadow-none hover:bg-accent/70"
            size="icon"
            variant="outline"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5">
            <Link href={`/dashboard/facility/shifts/${shiftId}/edit`}>Edit Shift</Link>
          </DropdownMenuItem>
          {status !== "FILLED" ? (
            <DropdownMenuItem
              className="cursor-pointer rounded-xl px-3 py-2.5"
              onSelect={(event) => {
                event.preventDefault();
                setPendingAction("close");
              }}
            >
              {getCloseActionLabel(status)}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer rounded-xl px-3 py-2.5 text-red-500 focus:bg-red-500/10 focus:text-red-600"
            onSelect={(event) => {
              event.preventDefault();
              setPendingAction("delete");
            }}
          >
            Delete Shift
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={pendingAction === null}
              onClick={() => setPendingAction(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={pendingAction === null}
              onClick={() => {
                void handleConfirm();
              }}
              variant={pendingAction === "delete" ? "destructive" : "default"}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
