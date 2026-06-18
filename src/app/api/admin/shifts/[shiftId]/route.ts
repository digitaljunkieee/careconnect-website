import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import {
  adminShiftActionSchema
} from "@/lib/validators/admin";
import {
  cancelAdminShift,
  reassignAdminShift
} from "@/lib/admin-actions";

type RouteContext = {
  params: Promise<{ shiftId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const { shiftId } = await context.params;
    const body = await request.json();
    const parsed = adminShiftActionSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    if (parsed.data.action === "CANCEL") {
      const result = await cancelAdminShift(admin.id, shiftId, parsed.data.notes);
      return jsonSuccess(result, "Shift cancelled.");
    }

    if (!parsed.data.workerId) {
      return jsonError("Worker ID is required.", 400);
    }

    const result = await reassignAdminShift(
      admin.id,
      shiftId,
      parsed.data.workerId,
      parsed.data.notes
    );

    return jsonSuccess(result, "Shift reassigned.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update shift.",
      getErrorStatus(error)
    );
  }
}
