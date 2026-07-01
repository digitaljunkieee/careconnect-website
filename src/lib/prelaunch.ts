export function isPrelaunchSurveyEnabled() {
  return process.env.NEXT_PUBLIC_PRELAUNCH_SURVEY_MODE === "true";
}
