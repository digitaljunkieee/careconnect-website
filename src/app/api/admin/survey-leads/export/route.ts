import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError } from "@/lib/api";
import { exportAdminSurveyLeadsCsv } from "@/lib/survey-leads";
import { SURVEY_USER_TYPES, type SurveyUserType } from "@/lib/validators/survey";

export async function GET(request: NextRequest) {
  const admin = await requireSessionUser(["ADMIN"]);

  if (!admin?.id) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const requestedType = searchParams.get("userType") ?? "";
    const userType = SURVEY_USER_TYPES.includes(requestedType as SurveyUserType)
      ? (requestedType as SurveyUserType)
      : undefined;
    const csv = await exportAdminSurveyLeadsCsv({ search, userType });

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
