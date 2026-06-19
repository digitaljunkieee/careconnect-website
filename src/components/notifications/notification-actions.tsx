"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  markAllNotificationsRead,
  markNotificationRead
} from "@/lib/notification-client";
import { cn } from "@/lib/utils";

type MarkAllNotificationsButtonProps = {
  unreadCount: number;
  className?: string;
};

type MarkNotificationReadButtonProps = {
  notificationId: string;
  className?: string;
};

export function MarkAllNotificationsButton({
  unreadCount,
  className
}: MarkAllNotificationsButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  return (
    <Button
      className={cn("rounded-2xl", className)}
      disabled={!unreadCount || isPending}
      variant="outline"
      type="button"
      onClick={async () => {
        setIsPending(true);

        try {
          await markAllNotificationsRead();
          toast.success("Notifications marked as read.");
          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Unable to update notifications."
          );
        } finally {
          setIsPending(false);
        }
      }}
    >
      Mark all as read
      {unreadCount ? (
        <Badge className="ml-2 rounded-full px-2 py-0 text-[10px]">
          {unreadCount}
        </Badge>
      ) : null}
    </Button>
  );
}

export function MarkNotificationReadButton({
  notificationId,
  className
}: MarkNotificationReadButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  return (
    <Button
      className={cn("rounded-full", className)}
      disabled={isPending}
      size="sm"
      variant="outline"
      type="button"
      onClick={async () => {
        setIsPending(true);

        try {
          await markNotificationRead(notificationId);
          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Unable to update notifications."
          );
        } finally {
          setIsPending(false);
        }
      }}
    >
      Mark read
    </Button>
  );
}
