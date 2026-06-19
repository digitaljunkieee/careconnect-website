import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { markAllNotificationsAsRead } from "@/lib/notifications";

export async function PATCH() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const result = await markAllNotificationsAsRead(session.user.id);
    return jsonSuccess(result, "Notifications marked as read.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update notifications.",
      getErrorStatus(error)
    );
  }
}
