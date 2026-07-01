import { auth } from "@/auth";
import { ROLE_HOME } from "@/lib/constants";
import { redirect } from "next/navigation";
import { isPrelaunchSurveyEnabled } from "@/lib/prelaunch";

export default async function WorkerRegisterPage() {
  if (isPrelaunchSurveyEnabled()) {
    redirect("/waitlist?userType=CARE_WORKER");
  }

  const session = await auth();

  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role]);
  }

  redirect("/register?role=WORKER");
}
