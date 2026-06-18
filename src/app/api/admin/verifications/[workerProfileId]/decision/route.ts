import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { adminVerificationDecisionSchema } from "@/lib/validators/admin";
import { reviewVerificationRequest } from "@/lib/admin-actions";

type RouteContext = {
  params: Promise<{ workerProfileId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const { workerProfileId } = await context.params;
    const body = await request.json();
    const parsed = adminVerificationDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const result = await reviewVerificationRequest(
      admin.id,
      workerProfileId,
      parsed.data.decision,
      parsed.data.notes ?? ""
    );

    return jsonSuccess(result, "Verification decision saved.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update verification.",
      getErrorStatus(error)
    );
  }
}
