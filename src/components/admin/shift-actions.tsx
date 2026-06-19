"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AssignWorkerDialog } from "@/components/admin/assign-worker-dialog";
import type { AdminWorkerOption } from "@/lib/admin-platform";
import type { ShiftStatus } from "@/lib/constants";

type ShiftActionsProps = {
  shiftId: string;
  status: ShiftStatus;
  workers: AdminWorkerOption[];
  applicationCount: number;
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update shift.";
}

export function ShiftActions({
  shiftId,
  status,
  workers,
  applicationCount
}: ShiftActionsProps) {
  const router = useRouter();

  async function handleCloseShift() {
    try {
      const response = await fetch(`/api/admin/shifts/${shiftId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action: "CANCEL", notes: "" })
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      toast.success("Shift closed.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update shift.");
    }
  }

  async function handleDeleteShift() {
    if (!window.confirm("Delete this shift? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/shifts/${shiftId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      toast.success("Shift deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete shift.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild className="rounded-2xl" size="sm">
        <Link href={`/dashboard/admin/shifts/${shiftId}?tab=applications`}>
          Applicants ({applicationCount})
        </Link>
      </Button>
      <AssignWorkerDialog shiftId={shiftId} workers={workers} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-9 w-9 rounded-2xl" size="icon" variant="outline">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/admin/shifts/${shiftId}`}>View shift</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={status === "CLOSED"} onSelect={() => void handleCloseShift()}>
            Close shift
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={() => void handleDeleteShift()}
          >
            Delete shift
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
