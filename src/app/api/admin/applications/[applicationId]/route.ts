import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { reviewAdminApplication } from "@/lib/admin-actions";

const adminApplicationActionSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT", "ASSIGN"]),
  notes: z.string().trim().max(1000).optional().default("")
});

type RouteContext = {
  params: Promise<{ applicationId: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const { applicationId } = await params;
    const body = await request.json();
    const parsed = adminApplicationActionSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const result = await reviewAdminApplication(
      admin.id,
      applicationId,
      parsed.data.action,
      parsed.data.notes
    );

    return jsonSuccess(result, "Application updated.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update application.",
      getErrorStatus(error)
    );
  }
}
