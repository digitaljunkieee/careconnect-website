import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { adminSettingsPasswordSchema } from "@/lib/validators/admin";
import { updateAdminPassword } from "@/lib/admin-actions";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const parsed = adminSettingsPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const result = await updateAdminPassword(
      admin.id,
      parsed.data.currentPassword,
      parsed.data.newPassword
    );

    return jsonSuccess(result, "Password updated.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update password.",
      getErrorStatus(error)
    );
  }
}
