import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { facilityProfileSchema } from "@/lib/validators/facility";
import { getFacilityProfileData } from "@/lib/facility-portal";
import { saveFacilityProfile } from "@/lib/workflows";

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== "FACILITY" || !session.user.id) {
    return jsonError("Unauthorized.", 401);
  }

  const profile = await getFacilityProfileData(session.user.id);

  if (!profile) {
    return jsonError("Facility profile not found.", 404);
  }

  return jsonSuccess(profile);
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "FACILITY" || !session.user.id) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const parsed = facilityProfileSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const profile = await saveFacilityProfile(session.user.id, parsed.data);

    return jsonSuccess(profile, "Facility profile updated.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update facility profile.",
      getErrorStatus(error)
    );
  }
}
