"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDashboardTheme } from "@/components/providers/dashboard-theme-provider";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import {
  fetchLatestNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead
} from "@/lib/notification-client";
import type { NotificationFeedItem } from "@/lib/notifications";

export function NotificationBell() {
  const router = useRouter();
  const { theme } = useDashboardTheme();
  const isDarkDashboard = theme === "dark";
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState<NotificationFeedItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [error, setError] = React.useState("");

  const loadNotifications = React.useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [latest, unread] = await Promise.all([
        fetchLatestNotifications(5),
        fetchUnreadNotificationCount()
      ]);

      setNotifications(latest.rows);
      setUnreadCount(unread);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load notifications."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  React.useEffect(() => {
    if (open) {
      void loadNotifications();
    }
  }, [loadNotifications, open]);

  const triggerClassName = cn(
    "relative h-11 w-11 shrink-0 rounded-full",
    isDarkDashboard
      ? "border border-border/60 bg-background/70 text-foreground shadow-sm hover:bg-background/85"
      : "border border-border/70 bg-background/95 text-foreground shadow-sm hover:bg-accent/70"
  );
  const contentClassName = cn(
    "w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] overflow-hidden rounded-[24px] p-2",
    isDarkDashboard
      ? "!border !border-[rgba(255,255,255,0.08)] !bg-[#101D31] text-white !shadow-[0_24px_60px_rgba(2,6,23,0.32)]"
      : "!border !border-border/70 !bg-background text-foreground !shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
  );
  const menuRowClassName = cn(
    "group w-full cursor-pointer rounded-2xl px-3 py-3 transition-colors !items-start",
    isDarkDashboard
      ? "text-white/90 hover:!bg-[rgba(19,217,203,0.08)] data-[highlighted]:!bg-[rgba(19,217,203,0.08)] data-[highlighted]:!text-white"
      : "text-foreground/90 hover:!bg-accent/70 data-[highlighted]:!bg-accent/70 data-[highlighted]:!text-foreground"
  );
  const footerRowClassName = cn(
    "group w-full cursor-pointer rounded-2xl px-3 py-3 transition-colors !items-center",
    isDarkDashboard
      ? "text-white/90 hover:!bg-[rgba(19,217,203,0.08)] data-[highlighted]:!bg-[rgba(19,217,203,0.08)] data-[highlighted]:!text-white"
      : "text-foreground/90 hover:!bg-accent/70 data-[highlighted]:!bg-accent/70 data-[highlighted]:!text-foreground"
  );
  const submenuTextClassName = cn(
    "text-xs leading-5",
    isDarkDashboard ? "text-white/60" : "text-muted-foreground"
  );

  async function handleNotificationSelect(item: NotificationFeedItem) {
    try {
      await markNotificationRead(item.id);

      if (item.actionUrl) {
        router.push(item.actionUrl);
        return;
      }

      await loadNotifications();
    } catch (notificationError) {
      setError(
        notificationError instanceof Error
          ? notificationError.message
          : "Unable to update notifications."
      );
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setOpen(false);
      await loadNotifications();
    } catch (notificationError) {
      setError(
        notificationError instanceof Error
          ? notificationError.message
          : "Unable to update notifications."
      );
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open notifications"
          className={triggerClassName}
          size="icon"
          variant="outline"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-[#13d9cb] px-1.5 py-0.5 text-[10px] font-semibold text-[#040e26]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" collisionPadding={12} sideOffset={8} className={contentClassName}>
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5">Notifications</p>
            <p className={submenuTextClassName}>Latest updates</p>
          </div>
          <Button
            className="h-8 rounded-full px-3 text-xs"
            disabled={!unreadCount || isLoading}
            type="button"
            onClick={handleMarkAllRead}
            variant="ghost"
          >
            Mark all as read
          </Button>
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto overscroll-contain px-1 py-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-sm text-muted-foreground">{error}</div>
          ) : notifications.length ? (
            notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className={menuRowClassName}
                onSelect={() => {
                  void handleNotificationSelect(item);
                }}
              >
                <span
                  className={cn(
                    "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                    item.isRead ? "bg-transparent" : "bg-[#13d9cb]"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-5">{item.title}</p>
                      <p className={submenuTextClassName + " mt-1 line-clamp-2"}>
                        {item.message}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] leading-5 text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>
                {item.actionUrl ? (
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                ) : null}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-4 py-8 text-sm text-muted-foreground">No notifications yet.</div>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className={footerRowClassName}>
          <Link href="/dashboard/notifications">
            <span className="flex-1">View all notifications</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
