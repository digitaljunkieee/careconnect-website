import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLE_HOME } from "@/lib/constants";
import { isPrelaunchSurveyEnabled } from "@/lib/prelaunch";
import { SURVEY_USER_TYPES, type SurveyUserType } from "@/lib/validators/survey";
import { BrandMark } from "@/components/layout/brand-mark";
import { EarlyAccessSurveyForm } from "@/components/auth/early-access-survey-form";

type WaitlistPageProps = {
  searchParams?: Promise<{ userType?: string }>;
};

export default async function WaitlistPage({ searchParams }: WaitlistPageProps) {
  if (!isPrelaunchSurveyEnabled()) {
    redirect("/register");
  }

  const session = await auth();

  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role]);
  }

  const params = await searchParams;
  const requestedType = params?.userType?.toUpperCase() ?? "";
  const initialUserType = SURVEY_USER_TYPES.includes(requestedType as SurveyUserType)
    ? (requestedType as SurveyUserType)
    : undefined;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(43,185,255,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(19,217,203,0.12),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#eef6fb_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-4 px-1">
          <BrandMark compact />
          <span className="hidden text-sm text-slate-500 sm:block">CareConnect is preparing for launch</span>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8 lg:p-10">
          <EarlyAccessSurveyForm initialUserType={initialUserType} />
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-5 text-slate-500">
          Your responses are used to plan CareConnect early access and launch updates. We are not creating a live staffing account yet.
        </p>
      </div>
    </main>
  );
}
