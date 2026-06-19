import type { NotificationFeedItem, NotificationListData } from "@/lib/notifications";

type NotificationApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message?: string;
  };
};

async function parseNotificationError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | NotificationApiEnvelope<unknown>
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update notifications.";
}

async function fetchNotificationEnvelope<T>(href: string) {
  const response = await fetch(href, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseNotificationError(response));
  }

  const payload = (await response.json()) as NotificationApiEnvelope<T>;

  if (!payload.success || !payload.data) {
    throw new Error(payload.message ?? "Unable to update notifications.");
  }

  return payload.data;
}

export async function fetchNotifications(params?: {
  page?: number;
  pageSize?: number;
  readStatus?: "ALL" | "READ" | "UNREAD";
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params?.page ?? 1));
  searchParams.set("pageSize", String(params?.pageSize ?? 5));

  if (params?.readStatus && params.readStatus !== "ALL") {
    searchParams.set("readStatus", params.readStatus);
  }

  return fetchNotificationEnvelope<NotificationListData>(
    `/api/notifications?${searchParams.toString()}`
  );
}

export async function fetchUnreadNotificationCount() {
  const data = await fetchNotificationEnvelope<{ unreadCount: number }>(
    "/api/notifications/unread-count"
  );

  return data.unreadCount ?? 0;
}

export async function fetchLatestNotifications(pageSize = 5) {
  return fetchNotifications({
    page: 1,
    pageSize
  });
}

export async function markNotificationRead(notificationId: string) {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(await parseNotificationError(response));
  }
}

export async function markAllNotificationsRead() {
  const response = await fetch("/api/notifications/read-all", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(await parseNotificationError(response));
  }
}

export type { NotificationFeedItem, NotificationListData };
