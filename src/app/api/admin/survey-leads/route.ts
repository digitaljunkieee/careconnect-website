import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { getErrorStatus, jsonError, jsonSuccess } from "@/lib/api";
import { getAdminSurveyLeadListData } from "@/lib/survey-leads";
import {
  SURVEY_LEAD_STATUSES,
  SURVEY_USER_TYPES,
  type SurveyLeadStatus,
  type SurveyUserType
} from "@/lib/validators/survey";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);
    if (!admin?.isAdmin) return jsonError("Administrator access is required.", 403);

    const params = request.nextUrl.searchParams;
    const requestedType = params.get("userType") ?? "";
    const requestedStatus = params.get("status") ?? "";
    const userType = SURVEY_USER_TYPES.includes(requestedType as SurveyUserType)
      ? (requestedType as SurveyUserType)
      : undefined;
    const status = SURVEY_LEAD_STATUSES.includes(requestedStatus as SurveyLeadStatus)
      ? (requestedStatus as SurveyLeadStatus)
      : undefined;
    const data = await getAdminSurveyLeadListData(admin.accessToken ?? "", {
      page: Math.max(Number(params.get("page")) || 1, 1),
      pageSize: Math.min(Math.max(Number(params.get("pageSize")) || 20, 1), 100),
      search: params.get("search") ?? "",
      userType,
      status
    });

    return jsonSuccess(data);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load survey leads.",
      getErrorStatus(error)
    );
  }
}
