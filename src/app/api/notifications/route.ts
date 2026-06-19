import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import {
  createNotification,
  getUserNotificationsData
} from "@/lib/notifications";
import {
  NOTIFICATION_RECIPIENT_ROLES,
  NOTIFICATION_TYPES
} from "@/lib/constants";

const createNotificationSchema = z.object({
  recipient: z.string().trim().min(1),
  recipientRole: z.enum([...NOTIFICATION_RECIPIENT_ROLES]),
  title: z.string().trim().min(1).max(140),
  message: z.string().trim().min(1).max(1_000),
  type: z.enum([...NOTIFICATION_TYPES]).optional().catch("system"),
  actionUrl: z.string().trim().max(2_000).optional().catch("")
});

const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(50).optional().default(10),
  readStatus: z.enum(["ALL", "READ", "UNREAD"]).optional().catch("ALL")
});

function getNotificationApiKey() {
  return (
    process.env.NOTIFICATION_API_KEY ??
    process.env.BACKEND_API_KEY ??
    process.env.INTEGRATIONS_API_KEY ??
    ""
  );
}

function hasSystemAccess(request: NextRequest) {
  const requiredKey = getNotificationApiKey();
  if (!requiredKey) {
    return false;
  }

  const suppliedKey =
    request.headers.get("x-careconnect-api-key") ??
    request.headers.get("x-api-key") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";

  return suppliedKey === requiredKey;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const { searchParams } = new URL(request.url);
    const parsed = notificationQuerySchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      readStatus: searchParams.get("readStatus") ?? "ALL"
    });

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const data = await getUserNotificationsData(session.user.id, {
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      readStatus: parsed.data.readStatus === "ALL" ? undefined : parsed.data.readStatus
    });

    return jsonSuccess(data);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load notifications.",
      getErrorStatus(error)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const systemAccess = hasSystemAccess(request);

    if (!systemAccess && session?.user?.role !== "ADMIN") {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const parsed = createNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const created = await createNotification({
      recipient: parsed.data.recipient,
      recipientRole: parsed.data.recipientRole,
      title: parsed.data.title,
      message: parsed.data.message,
      type: parsed.data.type,
      actionUrl: parsed.data.actionUrl
    });

    const notification = Array.isArray(created) ? created[0] : created;

    return jsonSuccess(notification, "Notification created.", 201);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to create notification.",
      getErrorStatus(error)
    );
  }
}
