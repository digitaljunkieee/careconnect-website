import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { getUnreadNotificationCount } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const unreadCount = await getUnreadNotificationCount(session.user.id);

    return jsonSuccess({ unreadCount });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load unread notifications.",
      getErrorStatus(error)
    );
  }
}
