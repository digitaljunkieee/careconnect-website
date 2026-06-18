import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { adminWorkerStatusSchema } from "@/lib/validators/admin";
import { setWorkerActivationStatus } from "@/lib/admin-actions";

type RouteParams = {
  params: Promise<{ workerId: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const { workerId } = await params;
    const body = await request.json();
    const parsed = adminWorkerStatusSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const worker = await setWorkerActivationStatus(admin.id, workerId, parsed.data.isActive);

    return jsonSuccess(worker, "Worker status updated.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update worker.",
      getErrorStatus(error)
    );
  }
}
