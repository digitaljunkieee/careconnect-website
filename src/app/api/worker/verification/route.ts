import { auth } from "@/auth";
import { jsonError, jsonSuccess } from "@/lib/api";
import { getVerificationHistory } from "@/lib/worker-portal";

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== "WORKER" || !session.user.id) {
    return jsonError("Unauthorized.", 401);
  }

  const data = await getVerificationHistory(session.user.id);

  if (!data) {
    return jsonError("Worker profile not found.", 404);
  }

  return jsonSuccess(data);
}
