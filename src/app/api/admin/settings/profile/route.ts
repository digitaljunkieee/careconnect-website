import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { adminSettingsProfileSchema } from "@/lib/validators/admin";
import { updateAdminProfile } from "@/lib/admin-actions";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const parsed = adminSettingsProfileSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const profile = await updateAdminProfile(admin.id, parsed.data);
    return jsonSuccess(profile, "Admin profile updated.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update admin profile.",
      getErrorStatus(error)
    );
  }
}
