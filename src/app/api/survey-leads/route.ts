import { isPrelaunchSurveyEnabled } from "@/lib/prelaunch";
import { connectDB } from "@/lib/mongodb";
import { jsonError, jsonSuccess } from "@/lib/api";
import { surveyLeadSchema } from "@/lib/validators/survey";
import SurveyLead from "@/models/SurveyLead";

export async function POST(request: Request) {
  if (!isPrelaunchSurveyEnabled()) {
    return jsonError("The early-access survey is not currently active.", 404);
  }

  try {
    const body = await request.json();
    const parsed = surveyLeadSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Please review the highlighted survey fields.", 400, parsed.error.flatten());
    }

    await connectDB();

    const existing = await SurveyLead.exists({ email: parsed.data.email });

    if (existing) {
      return jsonError(
        "You have already joined the CareConnect waitlist with this email address.",
        409,
        { code: "DUPLICATE_SURVEY_LEAD" }
      );
    }

    const lead = await SurveyLead.create({
      ...parsed.data,
      status: "WAITLISTED"
    });

    return jsonSuccess(
      { id: String(lead._id), status: lead.status },
      "Your early-access response has been received.",
      201
    );
  } catch (error) {
    const duplicate =
      error && typeof error === "object" && "code" in error && error.code === 11000;

    if (duplicate) {
      return jsonError(
        "You have already joined the CareConnect waitlist with this email address.",
        409,
        { code: "DUPLICATE_SURVEY_LEAD" }
      );
    }

    console.error("[Survey lead submission error]", error);
    return jsonError(
      "We couldn't save your response right now. Please try again in a moment.",
      500
    );
  }
}
