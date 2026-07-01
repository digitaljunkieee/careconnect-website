import { isPrelaunchSurveyEnabled } from "@/lib/prelaunch";
import { jsonError } from "@/lib/api";
import { surveyLeadSchema } from "@/lib/validators/survey";
import { getBackendBaseUrl } from "@/lib/backend-url";

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

    const response = await fetch(`${getBackendBaseUrl()}/api/survey-leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store"
    });
    const payload = await response.text();

    return new Response(payload, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" }
    });
  } catch (error) {
    console.error("[Survey lead submission error]", error);
    return jsonError(
      "We couldn't save your response right now. Please try again in a moment.",
      500
    );
  }
}
