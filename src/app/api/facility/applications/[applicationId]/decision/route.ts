import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getErrorStatus, jsonError, jsonSuccess } from "@/lib/api";
import { applicationDecisionSchema } from "@/lib/validators/facility";
import { decideShiftApplication } from "@/lib/workflows";

type RouteContext = {
  params: Promise<{ applicationId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const { applicationId } = await context.params;

    if (session?.user?.role !== "FACILITY" || !session.user.id) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const parsed = applicationDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const result = await decideShiftApplication(
      session.user.id,
      applicationId,
      parsed.data.action
    );

    return jsonSuccess(result, "Application decision saved.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update application.",
      getErrorStatus(error)
    );
  }
}
