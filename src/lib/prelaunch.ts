export function isPrelaunchSurveyEnabled() {
  const configuredValue = process.env.NEXT_PUBLIC_PRELAUNCH_SURVEY_MODE
    ?.trim()
    .toLowerCase();

  // CareConnect is currently pre-launch, so a missing deployment variable must
  // not silently expose the live registration flow. Set the flag to `false`
  // explicitly when the platform is ready to accept full registrations.
  return configuredValue !== "false";
}
