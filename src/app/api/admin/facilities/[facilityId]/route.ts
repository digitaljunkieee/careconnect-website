import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { adminFacilityStatusSchema } from "@/lib/validators/admin";
import {
  deleteFacilityAccount,
  setFacilityActivationStatus
} from "@/lib/admin-actions";

type RouteContext = {
  params: Promise<{ facilityId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const { facilityId } = await context.params;
    const body = await request.json();
    const parsed = adminFacilityStatusSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const facility = await setFacilityActivationStatus(
      admin.id,
      facilityId,
      parsed.data.isActive
    );

    return jsonSuccess(facility, "Facility status updated.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update facility.",
      getErrorStatus(error)
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const { facilityId } = await context.params;
    const result = await deleteFacilityAccount(admin.id, facilityId);

    return jsonSuccess(result, "Facility deleted.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to delete facility.",
      getErrorStatus(error)
    );
  }
}
