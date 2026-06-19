import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { markNotificationAsRead } from "@/lib/notifications";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const { id } = await context.params;

    if (!session?.user?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const result = await markNotificationAsRead(session.user.id, id);

    if (!result.updated) {
      return jsonError("Notification not found.", 404);
    }

    return jsonSuccess(result, "Notification marked as read.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update notification.",
      getErrorStatus(error)
    );
  }
}
