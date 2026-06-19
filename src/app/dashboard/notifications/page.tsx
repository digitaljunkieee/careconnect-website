import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BellOff, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/pagination-controls";
import {
  MarkAllNotificationsButton,
  MarkNotificationReadButton
} from "@/components/notifications/notification-actions";
import { requireSessionUser } from "@/lib/auth-helpers";
import { formatRelativeTime } from "@/lib/format";
import { getUserNotificationsData } from "@/lib/notifications";
import {
  buildPageHref,
  getResponsivePageSize,
  parsePage,
  parsePageSize
} from "@/lib/pagination";
import { cn } from "@/lib/utils";

type NotificationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function EmptyState({ unreadFilter }: { unreadFilter: boolean }) {
  return (
    <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13d9cb]/10 text-[#13d9cb]">
        <BellOff className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">
        {unreadFilter ? "No unread notifications" : "No notifications yet"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {unreadFilter
          ? "You're up to date."
          : "Updates about shifts, applications, verification, and payments will appear here."}
      </p>
      {unreadFilter ? (
        <Button asChild className="mt-6 rounded-2xl" variant="outline">
          <Link href="/dashboard/notifications">Show all notifications</Link>
        </Button>
      ) : null}
    </div>
  );
}

export default async function NotificationsPage({
  searchParams
}: NotificationsPageProps) {
  const user = await requireSessionUser();

  if (!user) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(
    firstQueryValue(params.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const readStatus = firstQueryValue(params.readStatus);
  const isUnreadFilter = readStatus === "UNREAD";

  const data = await getUserNotificationsData(user.id, {
    page,
    pageSize,
    readStatus: isUnreadFilter ? "UNREAD" : undefined
  });

  const query = {
    readStatus: isUnreadFilter ? "UNREAD" : undefined,
    pageSize: String(pageSize)
  };
  const basePath = "/dashboard/notifications";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            Keep track of shifts, applications, verification, and payments.
          </p>
        </div>
        <MarkAllNotificationsButton unreadCount={data.unreadTotal} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          asChild
          className="rounded-full"
          variant={!isUnreadFilter ? "default" : "outline"}
        >
          <Link href={buildPageHref(basePath, { pageSize: String(pageSize) }, 1)}>
            All
          </Link>
        </Button>
        <Button
          asChild
          className="rounded-full"
          variant={isUnreadFilter ? "default" : "outline"}
        >
          <Link
            href={buildPageHref(basePath, { pageSize: String(pageSize), readStatus: "UNREAD" }, 1)}
          >
            Unread
          </Link>
        </Button>
      </div>

      {data.rows.length ? (
        <div className="space-y-3">
          {data.rows.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "border-border/70 shadow-sm transition-colors",
                !notification.isRead && "border-[#13d9cb]/25 bg-[#13d9cb]/6"
              )}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-2 h-2.5 w-2.5 shrink-0 rounded-full",
                      notification.isRead ? "bg-transparent" : "bg-[#13d9cb]"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold">
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {notification.actionUrl ? (
                            <Button asChild className="rounded-full" size="sm" variant="outline">
                              <Link href={notification.actionUrl}>
                                Open
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          ) : null}
                          {!notification.isRead ? (
                            <MarkNotificationReadButton
                              notificationId={notification.id}
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState unreadFilter={isUnreadFilter} />
      )}

      {data.total > 0 && data.pageCount > 1 ? (
        <PaginationControls
          nextHref={buildPageHref(
            basePath,
            query,
            Math.min(data.page + 1, data.pageCount)
          )}
          page={data.page}
          pageCount={data.pageCount}
          previousHref={buildPageHref(
            basePath,
            query,
            Math.max(data.page - 1, 1)
          )}
        />
      ) : null}
    </div>
  );
}
