import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError } from "@/lib/api";
import { exportAdminSurveyLeadsCsv } from "@/lib/survey-leads";
import {
  SURVEY_LEAD_STATUSES,
  SURVEY_USER_TYPES,
  type SurveyLeadStatus,
  type SurveyUserType
} from "@/lib/validators/survey";

export async function GET(request: NextRequest) {
  const admin = await requireSessionUser(["ADMIN"]);

  if (!admin?.id || !admin.isAdmin) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const requestedType = searchParams.get("userType") ?? "";
    const requestedStatus = searchParams.get("status") ?? "";
    const userType = SURVEY_USER_TYPES.includes(requestedType as SurveyUserType)
      ? (requestedType as SurveyUserType)
      : undefined;
    const status = SURVEY_LEAD_STATUSES.includes(requestedStatus as SurveyLeadStatus)
      ? (requestedStatus as SurveyLeadStatus)
      : undefined;
    const csv = await exportAdminSurveyLeadsCsv(admin.accessToken ?? "", {
      search,
      userType,
      status
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="careconnect-survey-leads.csv"'
      }
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to export survey leads.",
      500
    );
  }
}
