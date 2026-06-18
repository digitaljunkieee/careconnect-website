import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonError, jsonSuccess } from "@/lib/api";
import { applicantQuerySchema } from "@/lib/validators/facility";
import { getShiftApplicantsData } from "@/lib/facility-portal";

type RouteContext = {
  params: Promise<{ shiftId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth();
  const { shiftId } = await context.params;

  if (session?.user?.role !== "FACILITY" || !session.user.id) {
    return jsonError("Unauthorized.", 401);
  }

  const { searchParams } = new URL(request.url);
  const parsed = applicantQuerySchema.safeParse({
    page: searchParams.get("page"),
    pageSize: searchParams.get("pageSize"),
    applicationStatus: searchParams.get("applicationStatus") ?? undefined,
    verificationStatus: searchParams.get("verificationStatus") ?? undefined
  });

  if (!parsed.success) {
    return jsonError("Validation failed.", 400, parsed.error.flatten());
  }

  const data = await getShiftApplicantsData(session.user.id, shiftId, parsed.data);

  if (!data) {
    return jsonError("Shift not found.", 404);
  }

  return jsonSuccess(data);
}
