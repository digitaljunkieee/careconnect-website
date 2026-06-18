"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationActionButton } from "@/components/confirmation-action-button";

type NotificationRowActionsProps = {
  notificationId: string;
  isRead: boolean;
};

type MarkAllNotificationsButtonProps = {
  unreadCount: number;
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update notifications.";
}

export function NotificationRowActions({
  notificationId,
  isRead
}: NotificationRowActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        className="rounded-2xl"
        disabled={isRead}
        size="sm"
        variant="outline"
        onClick={async () => {
          try {
            const response = await fetch("/api/admin/notifications", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ ids: [notificationId] })
            });

            if (!response.ok) {
              throw new Error(await parseApiError(response));
            }

            toast.success("Notification marked as read.");
            router.refresh();
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Unable to update notifications."
            );
          }
        }}
      >
        {isRead ? "Read" : "Mark read"}
      </Button>
      <ConfirmationActionButton
        confirmLabel="Delete"
        confirmVariant="destructive"
        description="This will remove the notification from the admin notification center."
        onConfirm={async () => {
          const response = await fetch("/api/admin/notifications", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ ids: [notificationId] })
          });

          if (!response.ok) {
            throw new Error(await parseApiError(response));
          }

          toast.success("Notification deleted.");
          router.refresh();
        }}
        title="Delete this notification?"
        triggerClassName="rounded-2xl"
        triggerVariant="outline"
      >
        Delete
      </ConfirmationActionButton>
    </div>
  );
}

export function MarkAllNotificationsButton({ unreadCount }: MarkAllNotificationsButtonProps) {
  const router = useRouter();

  return (
    <Button
      className="rounded-2xl"
      disabled={!unreadCount}
      variant="outline"
      onClick={async () => {
        try {
          const response = await fetch("/api/admin/notifications", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ markAll: true })
          });

          if (!response.ok) {
            throw new Error(await parseApiError(response));
          }

          toast.success("All notifications marked as read.");
          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Unable to update notifications."
          );
        }
      }}
    >
      Mark all as read
      {unreadCount ? <Badge className="ml-2 rounded-full px-2 py-0 text-[10px]">{unreadCount}</Badge> : null}
    </Button>
  );
}
