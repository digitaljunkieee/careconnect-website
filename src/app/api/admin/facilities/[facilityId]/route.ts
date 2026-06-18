import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { adminFacilityStatusSchema } from "@/lib/validators/admin";
import { setFacilityActivationStatus } from "@/lib/admin-actions";

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
