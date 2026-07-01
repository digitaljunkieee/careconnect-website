import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { adminShiftReassignSchema } from "@/lib/validators/admin";
import { assignWorkerThroughBackend } from "@/lib/backend-admin";

type RouteContext = { params: Promise<{ shiftId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id || !admin.isAdmin) {
      return jsonError("Administrator access is required.", 403);
    }

    const body = await request.json();
    const parsed = adminShiftReassignSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const { shiftId } = await context.params;
    const result = await assignWorkerThroughBackend(admin.accessToken ?? "", shiftId, parsed.data);
    return jsonSuccess(result, "Worker assigned successfully.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to assign worker.",
      getErrorStatus(error)
    );
  }
}
