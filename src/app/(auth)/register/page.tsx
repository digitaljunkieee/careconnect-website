import { auth } from "@/auth";
import { ROLE_HOME } from "@/lib/constants";
import { redirect } from "next/navigation";
import { RegistrationForm } from "@/components/auth/registration-form";
import { isPrelaunchSurveyEnabled } from "@/lib/prelaunch";

type RegisterPageProps = {
  searchParams?: Promise<{
    role?: string;
  }>;
};

function parseInitialRole(role?: string) {
  if (role?.toUpperCase() === "WORKER") {
    return "WORKER" as const;
  }

  if (role?.toUpperCase() === "FACILITY") {
    return "FACILITY" as const;
  }

  return undefined;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  if (isPrelaunchSurveyEnabled()) {
    const userType =
      parseInitialRole(params?.role) === "WORKER"
        ? "CARE_WORKER"
        : parseInitialRole(params?.role) === "FACILITY"
          ? "CARE_FACILITY"
          : "";

    redirect(userType ? `/waitlist?userType=${userType}` : "/waitlist");
  }

  const session = await auth();

  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role]);
  }

  return <RegistrationForm initialRole={parseInitialRole(params?.role)} />;
}
