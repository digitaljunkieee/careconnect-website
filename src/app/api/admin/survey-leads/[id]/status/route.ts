import { requireSessionUser } from "@/lib/auth-helpers";
import { getErrorStatus, jsonError, jsonSuccess } from "@/lib/api";
import { updateAdminSurveyLeadStatus } from "@/lib/survey-leads";
import { SURVEY_LEAD_STATUSES, type SurveyLeadStatus } from "@/lib/validators/survey";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);
    if (!admin?.isAdmin) return jsonError("Administrator access is required.", 403);

    const body = (await request.json()) as { status?: string };
    if (!SURVEY_LEAD_STATUSES.includes(body.status as SurveyLeadStatus)) {
      return jsonError("Select a valid lead status.", 400);
    }

    const { id } = await context.params;
    const lead = await updateAdminSurveyLeadStatus(
      admin.accessToken ?? "",
      id,
      body.status as SurveyLeadStatus
    );
    return jsonSuccess(lead, "Survey lead status updated.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update this survey lead.",
      getErrorStatus(error)
    );
  }
}
