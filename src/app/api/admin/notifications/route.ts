import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import {
  adminNotificationIdsSchema
} from "@/lib/validators/admin";
import {
  deleteNotifications,
  markAllNotificationsAsRead,
  markNotificationsAsRead
} from "@/lib/admin-actions";

const notificationMutationSchema = z
  .object({
    ids: z.array(z.string().trim().min(1)).optional(),
    markAll: z.boolean().optional()
  })
  .refine((value) => value.markAll || (value.ids?.length ?? 0) > 0, {
    message: "At least one notification ID is required."
  });

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const parsed = notificationMutationSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    if (parsed.data.markAll) {
      const result = await markAllNotificationsAsRead(admin.id);
      return jsonSuccess(result, "Notifications marked as read.");
    }

    const ids = parsed.data.ids ?? [];
    const validated = adminNotificationIdsSchema.safeParse({ ids });

    if (!validated.success) {
      return jsonError("Validation failed.", 400, validated.error.flatten());
    }

    const result = await markNotificationsAsRead(admin.id, validated.data.ids);
    return jsonSuccess(result, "Notifications marked as read.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update notifications.",
      getErrorStatus(error)
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const parsed = adminNotificationIdsSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const result = await deleteNotifications(admin.id, parsed.data.ids);
    return jsonSuccess(result, "Notifications deleted.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to delete notifications.",
      getErrorStatus(error)
    );
  }
}
