import { requireSessionUser } from "@/lib/auth-helpers";
import { getErrorStatus, jsonError, jsonSuccess } from "@/lib/api";
import { getAdminSurveyLeadDetail } from "@/lib/survey-leads";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);
    if (!admin?.isAdmin) return jsonError("Administrator access is required.", 403);

    const { id } = await context.params;
    const lead = await getAdminSurveyLeadDetail(admin.accessToken ?? "", id);
    return jsonSuccess(lead);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load this survey response.",
      getErrorStatus(error)
    );
  }
}
