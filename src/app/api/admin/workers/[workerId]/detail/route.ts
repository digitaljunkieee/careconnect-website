import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { getAdminWorkerDetailData } from "@/lib/admin-data";
import { getErrorStatus, jsonError, jsonSuccess } from "@/lib/api";

type RouteContext = {
  params: Promise<{ workerId: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const { workerId } = await params;
    const data = await getAdminWorkerDetailData(workerId);

    if (!data) {
      return jsonError("Worker profile not found.", 404);
    }

    return jsonSuccess(data, "Worker profile loaded.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load worker profile.",
      getErrorStatus(error)
    );
  }
}
