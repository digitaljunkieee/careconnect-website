import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import {
  shiftStatusSchema,
  shiftUpdateSchema
} from "@/lib/validators/facility";
import {
  deleteShiftForFacility,
  getFacilityShiftById
} from "@/lib/facility-portal";
import {
  setShiftStatusForFacility,
  updateShiftForFacility
} from "@/lib/workflows";

type RouteContext = {
  params: Promise<{ shiftId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  const { shiftId } = await context.params;

  if (session?.user?.role !== "FACILITY" || !session.user.id) {
    return jsonError("Unauthorized.", 401);
  }

  const shift = await getFacilityShiftById(session.user.id, shiftId);
  if (!shift) {
    return jsonError("Shift not found.", 404);
  }

  return jsonSuccess(shift);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const { shiftId } = await context.params;

    if (session?.user?.role !== "FACILITY" || !session.user.id) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const statusOnly = shiftStatusSchema.safeParse(body);

    if (statusOnly.success && Object.keys(body).length === 1) {
      const shift = await setShiftStatusForFacility(
        session.user.id,
        shiftId,
        statusOnly.data.status
      );

      return jsonSuccess(shift, "Shift status updated successfully.");
    }

    const parsed = shiftUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const shift = await updateShiftForFacility(session.user.id, shiftId, parsed.data);

    return jsonSuccess(shift, "Shift updated successfully.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update shift.",
      getErrorStatus(error)
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const { shiftId } = await context.params;

    if (session?.user?.role !== "FACILITY" || !session.user.id) {
      return jsonError("Unauthorized.", 401);
    }

    const result = await deleteShiftForFacility(session.user.id, shiftId);
    return jsonSuccess(result, "Shift deleted successfully.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to delete shift.",
      getErrorStatus(error)
    );
  }
}
