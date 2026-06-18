import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MarkAllNotificationsButton,
  NotificationRowActions
} from "@/components/admin/notification-actions";
import { getAdminNotificationListData } from "@/lib/admin-platform";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { NOTIFICATION_TYPES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export default async function AdminNotificationsPage({
  searchParams
}: NotificationsPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(firstQueryValue(params.pageSize), 10);
  const search = firstQueryValue(params.search);
  const type = firstQueryValue(params.type);
  const readStatus = firstQueryValue(params.readStatus);

  const data = await getAdminNotificationListData({
    page,
    pageSize,
    search,
    type: type && type !== "ALL" ? (type as (typeof NOTIFICATION_TYPES)[number]) : undefined,
    readStatus:
      readStatus && readStatus !== "ALL"
        ? (readStatus as "READ" | "UNREAD")
        : undefined
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.total}</CardTitle>
            <CardDescription>Total notifications</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.unreadTotal}</CardTitle>
            <CardDescription>Unread notifications</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.pageCount}</CardTitle>
            <CardDescription>Total pages</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Notification Center</CardTitle>
              <CardDescription>
                Review notifications, mark items as read, or remove stale entries.
              </CardDescription>
            </div>
            <MarkAllNotificationsButton unreadCount={data.unreadTotal} />
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-6" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium" htmlFor="search">
                Search
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Title, message, or user"
                defaultValue={search}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="type">
                Type
              </label>
              <select
                className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"
                defaultValue={type || "ALL"}
                id="type"
                name="type"
              >
                <option value="ALL">All</option>
                {NOTIFICATION_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="readStatus">
                Read status
              </label>
              <select
                className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"
                defaultValue={readStatus || "ALL"}
                id="readStatus"
                name="readStatus"
              >
                <option value="ALL">All</option>
                <option value="READ">Read</option>
                <option value="UNREAD">Unread</option>
              </select>
            </div>
            <div className="flex items-end gap-3 lg:col-span-6">
              <Button className="rounded-2xl" type="submit">
                Apply filters
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/notifications">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            {data.rows.length
              ? "The filtered notifications are ready for review."
              : "No notifications match the current filters. Clear the filters to view every message."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.rows.length ? (
            <div className="overflow-hidden rounded-3xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Notification Title</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Read Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-t border-border/60">
                      <td className="px-4 py-4">
                        <div className="font-medium">{row.title}</div>
                        <div className="text-xs text-muted-foreground">{row.message}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{row.userName || "Unknown user"}</div>
                        <div className="text-xs text-muted-foreground">{row.userEmail}</div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">{row.type}</Badge>
                      </td>
                      <td className="px-4 py-4">{formatDateTime(row.createdAt)}</td>
                      <td className="px-4 py-4">
                        <Badge variant={row.isRead ? "soft" : "secondary"}>
                          {row.isRead ? "Read" : "Unread"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <NotificationRowActions
                          isRead={row.isRead}
                          notificationId={row.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="No notifications match the current filters. Clear the filters to view every message." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
